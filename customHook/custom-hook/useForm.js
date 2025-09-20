// src/customHook/useForm.js
import { useCallback, useMemo, useState } from "react";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useForm({ initial = {}, onSubmit, validate } = {}) {
  const [values, setValues] = useState(() => ({ ...initial }));
  const [errors, setErrors] = useState({});

  const runValidate = useCallback(
    (v) => {
      const e = validate ? validate(v) : {};
      setErrors(e || {});
      return e;
    },
    [validate]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues({ ...initial });
    setErrors({});
  }, [initial]);

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault?.();
      const eMap = runValidate(values);
      if (Object.keys(eMap).length === 0 && typeof onSubmit === "function") {
        onSubmit(values, { reset });
      }
    },
    [values, onSubmit, runValidate, reset]
  );

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return { values, errors, isValid, handleChange, handleSubmit, reset, setValues, setErrors };
}

export function defaultValidateRegistration(v) {
  const e = {};
  if (!v.firstName?.trim()) e.firstName = "Required";
  if (!v.lastName?.trim()) e.lastName = "Required";
  if (!v.email?.trim()) e.email = "Required";
  else if (!emailRe.test(v.email)) e.email = "Invalid email";
  if (!v.password?.trim()) e.password = "Required";
  else if (v.password.length < 6) e.password = "Min 6 chars";
  if (!v.confirm?.trim()) e.confirm = "Required";
  else if (v.confirm !== v.password) e.confirm = "Passwords do not match";
  return e;
}
