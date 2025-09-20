import React from "react";
import { useForm, defaultValidateRegistration } from "../customHook/useForm";
import "./TaskOne.css";

const initial = { firstName: "", lastName: "", email: "", password: "", confirm: "" };

export default function TaskOne() {
  const { values, errors, handleChange, handleSubmit, isValid, reset } = useForm({
    initial,
    validate: defaultValidateRegistration,
    onSubmit: (vals, { reset }) => {
      console.log("REGISTER:", vals);
      alert("Submitted! Check console.");
      reset();
    },
  });

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} noValidate>
        <Field name="firstName" placeholder="First Name" value={values.firstName} onChange={handleChange} error={errors.firstName} />
        <Field name="lastName"  placeholder="Last Name"  value={values.lastName}  onChange={handleChange} error={errors.lastName} />
        <Field name="email"     placeholder="Email"      value={values.email}     onChange={handleChange} error={errors.email} type="email" />
        <Field name="password"  placeholder="Password"   value={values.password}  onChange={handleChange} error={errors.password} type="password" />
        <Field name="confirm"   placeholder="Confirm Password" value={values.confirm} onChange={handleChange} error={errors.confirm} type="password" />

        <button className="form-button" type="submit" disabled={!isValid}>Register</button>
        <button className="form-button" type="button" onClick={reset}>Reset</button>
      </form>
    </div>
  );
}

function Field({ error, ...rest }) {
  return (
    <>
      <input {...rest} className="form-input" />
      {error ? <div className="error-message">{error}</div> : null}
    </>
  );
}
