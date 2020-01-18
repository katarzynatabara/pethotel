const FirebaseRepository = require('./firebaseRepository');
const admin = require('firebase-admin');
const FirebaseQuery = require('../utils/firebaseQuery');
const Booking = require('../models/booking');
const AuditLogRepository = require('./auditLogRepository');

/**
 * Handles database operations for the Booking.
 */
class BookingRepository {
  /**
   * Creates the Booking.
   *
   * @param {Object} data
   * @param {Object} [options]
   */
  async create(data, options) {
    const record = {
      id: FirebaseRepository.newId(),
      ...new Booking().cast(data),
      createdBy: FirebaseRepository.getCurrentUser(options)
        .id,
      createdAt: FirebaseRepository.serverTimestamp(),
      updatedBy: FirebaseRepository.getCurrentUser(options)
        .id,
      updatedAt: FirebaseRepository.serverTimestamp(),
    };

    await FirebaseRepository.executeOrAddToBatch(
      'set',
      admin
        .firestore()
        .doc(
          `${new Booking().collectionName}/${record.id}`,
        ),
      record,
      options,
    );

    await this._createAuditLog(
      AuditLogRepository.CREATE,
      record.id,
      data,
      options,
    );

    await FirebaseRepository.refreshTwoWayRelationOneToMany(
      record,
      'pet',
      'pet',
      'bookings',
      options,
    );

    return record;
  }

  /**
   * Updates the Booking.
   *
   * @param {Object} data
   * @param {Object} [options]
   */
  async update(id, data, options) {
    const record = {
      id,
      ...new Booking().cast(data),
      updatedBy: FirebaseRepository.getCurrentUser(options)
        .id,
      updatedAt: FirebaseRepository.serverTimestamp(),
    };

    await FirebaseRepository.executeOrAddToBatch(
      'update',
      admin
        .firestore()
        .doc(
          `${new Booking().collectionName}/${record.id}`,
        ),
      record,
      options,
    );

    await this._createAuditLog(
      AuditLogRepository.UPDATE,
      id,
      data,
      options,
    );

    await FirebaseRepository.refreshTwoWayRelationOneToMany(
      record,
      'pet',
      'pet',
      'bookings',
      options,
    );

    return record;
  }

  /**
   * Deletes the Booking.
   *
   * @param {string} id
   * @param {Object} [options]
   */
  async destroy(id, options) {
    await FirebaseRepository.executeOrAddToBatch(
      'delete',
      admin
        .firestore()
        .doc(`${new Booking().collectionName}/${id}`),
      null,
      options,
    );

    await this._createAuditLog(
      AuditLogRepository.DELETE,
      id,
      null,
      options,
    );

    await FirebaseRepository.destroyRelationToMany(
      id,
      'pet',
      'bookings',
      options,
    );
  }

  /**
   * Counts the number of Bookings based on the filter.
   *
   * @param {Object} filter
   */
  async count(filter) {
    let chain = admin
      .firestore()
      .collection(new Booking().collectionName);

    if (filter) {
      Object.keys(filter).forEach((key) => {
        chain = chain.where(key, '==', filter[key]);
      });
    }

    return (await chain.get()).size;
  }

  /**
   * Finds the Booking and its relations.
   *
   * @param {string} id
   */
  async findById(id) {
    const record = await FirebaseRepository.findDocument(
      'booking',
      id,
    );
    return this.populate(record);
  }

  /**
   * Finds the Bookings based on the query.
   * See https://mongoosejs.com/docs/queries.html to learn how
   * to customize the queries.
   *
   * @param {Object} query
   * @param {Object} query.filter
   * @param {number} query.limit
   * @param  {number} query.offset
   * @param  {string} query.orderBy
   *
   * @returns {Promise<Object>} response - Object containing the rows and the count.
   */
  async findAndCountAll(
    { filter, limit, offset, orderBy } = {
      filter: null,
      limit: 0,
      offset: 0,
      orderBy: null,
    },
  ) {
    const query = FirebaseQuery.forList({
      limit,
      offset,
      orderBy: orderBy || 'createdAt_DESC',
    });

    if (filter) {
      if (filter.id) {
        query.appendId('id', filter.id);
      }

      if (filter.owner) {
        query.appendId('owner', filter.owner);
      }

      if (filter.pet) {
        query.appendId('pet', filter.pet);
      }

      if (filter.arrivalRange) {
        query.appendRange(
          'arrival',
          filter.arrivalRange,
        );
      }

      if (filter.departureRange) {
        query.appendRange(
          'departure',
          filter.departureRange,
        );
      }

      if (filter.status) {
        query.appendEqual('status', filter.status);
      }

      if (filter.feeRange) {
        query.appendRange(
          'fee',
          filter.feeRange,
        );
      }

      if (filter.createdAtRange) {
        query.appendRange(
          'createdAt',
          filter.createdAtRange,
        );
      }
    }

    const collection = await admin
      .firestore()
      .collection(`booking`)
      .get();

    const all = FirebaseRepository.mapCollection(
      collection,
    );
    const rows = await this.populateAll(query.rows(all));
    const count = query.count(all);

    return { rows, count };
  }

  /**
   * Lists the Bookings to populate the autocomplete.
   * See https://mongoosejs.com/docs/queries.html to learn how to
   * customize the query.
   *
   * @param {Object} search
   * @param {number} limit
   */
  async findAllAutocomplete(search, limit) {
    const query = FirebaseQuery.forAutocomplete({
      limit,
      orderBy: 'id_ASC',
    });

    if (search) {
      query.appendId('id', search);

    }

    const collection = await admin
      .firestore()
      .collection(`booking`)
      .get();

    const all = FirebaseRepository.mapCollection(
      collection,
    );
    const rows = query.rows(all);

    return rows.map((record) => ({
      id: record.id,
      label: record['id'],
    }));
  }

  /**
   * Populates the records with all its relations.
   * @param {*} records
   */
  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
    );
  }

  /**
   * Populates the record with all its relations.
   * @param {*} record
   */
  async populate(record) {
    if (!record) {
      return record;
    }

    record.pet = await FirebaseRepository.findRelation(
      'pet',
      record.pet,
    );

    record.owner = await FirebaseRepository.findRelation(
      'user',
      record.owner,
    );

    return record;
  }

  /**
   * Creates an audit log of the operation.
   *
   * @param {string} action - The action [create, update or delete].
   * @param {object} id - The record id
   * @param {object} data - The new data passed on the request
   * @param {object} options
   */
  async _createAuditLog(action, id, data, options) {
    await AuditLogRepository.log(
      {
        entityName: new Booking().modelName,
        entityId: id,
        action,
        values: data,
      },
      options,
    );
  }
}

module.exports = BookingRepository;
