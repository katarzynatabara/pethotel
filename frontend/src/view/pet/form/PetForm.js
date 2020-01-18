import { Button, Form } from 'antd';
import { Formik } from 'formik';
import { i18n } from 'i18n';
import model from 'modules/pet/petModel';
import React, { Component } from 'react';
import ViewFormItem from 'view/shared/form/items/ViewFormItem';
import Spinner from 'view/shared/Spinner';
import FormWrapper, {
  tailFormItemLayout,
} from 'view/shared/styles/FormWrapper';
import FormSchema from 'view/shared/form/formSchema';
import InputFormItem from 'view/shared/form/items/InputFormItem';
import UserAutocompleteFormItem from 'view/iam/autocomplete/UserAutocompleteFormItem';
import SelectFormItem from 'view/shared/form/items/SelectFormItem';
import BookingAutocompleteFormItem from 'view/booking/autocomplete/BookingAutocompleteFormItem';

const { fields } = model;

class PetForm extends Component {
  schema = new FormSchema(fields.id, [
    fields.owner,
    fields.name,
    fields.type,
    fields.breed,
    fields.size,
    fields.bookings,
  ]);

  handleSubmit = (values) => {
    const { id, ...data } = this.schema.cast(values);
    this.props.onSubmit(id, data);
  };

  initialValues = () => {
    const record = this.props.record;
    return this.schema.initialValues(record || {});
  };

  renderForm() {
    const { saveLoading, isEditing } = this.props;

    return (
      <FormWrapper>
        <Formik
          initialValues={this.initialValues()}
          validationSchema={this.schema.schema}
          onSubmit={this.handleSubmit}
          render={(form) => {
            return (
              <Form onSubmit={form.handleSubmit}>
                {isEditing && (
                  <ViewFormItem
                    name={fields.id.name}
                    label={fields.id.label}
                  />
                )}

                <UserAutocompleteFormItem
                  name={fields.owner.name}
                  label={fields.owner.label}
                  required={fields.owner.required}
                  showCreate={!this.props.modal}
                  form={form}
                />
                <InputFormItem
                  name={fields.name.name}
                  label={fields.name.label}
                  required={fields.name.required}
                />
                <SelectFormItem
                  name={fields.type.name}
                  label={fields.type.label}
                  options={fields.type.options.map(
                    (item) => ({
                      value: item.id,
                      label: item.label,
                    }),
                  )}
                  required={fields.type.required}
                />
                <InputFormItem
                  name={fields.breed.name}
                  label={fields.breed.label}
                  required={fields.breed.required}
                />
                <SelectFormItem
                  name={fields.size.name}
                  label={fields.size.label}
                  options={fields.size.options.map(
                    (item) => ({
                      value: item.id,
                      label: item.label,
                    }),
                  )}
                  required={fields.size.required}
                />
                <BookingAutocompleteFormItem
                  name={fields.bookings.name}
                  label={fields.bookings.label}
                  required={fields.bookings.required}
                  showCreate={!this.props.modal}
                  form={form}
                  mode="multiple"
                />

                <Form.Item
                  className="form-buttons"
                  {...tailFormItemLayout}
                >
                  <Button
                    loading={saveLoading}
                    type="primary"
                    onClick={form.handleSubmit}
                    icon="save"
                  >
                    {i18n('common.save')}
                  </Button>

                  <Button
                    disabled={saveLoading}
                    onClick={form.handleReset}
                    icon="undo"
                  >
                    {i18n('common.reset')}
                  </Button>

                  {this.props.onCancel ? (
                    <Button
                      disabled={saveLoading}
                      onClick={() => this.props.onCancel()}
                      icon="close"
                    >
                      {i18n('common.cancel')}
                    </Button>
                  ) : null}
                </Form.Item>
              </Form>
            );
          }}
        />
      </FormWrapper>
    );
  }

  render() {
    const { isEditing, findLoading, record } = this.props;

    if (findLoading) {
      return <Spinner />;
    }

    if (isEditing && !record) {
      return <Spinner />;
    }

    return this.renderForm();
  }
}

export default PetForm;
