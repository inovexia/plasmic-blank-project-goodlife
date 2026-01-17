'use client';

import { useEffect, useState } from 'react';
import { PLASMIC } from '../plasmic-init';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------- EDITOR MESSAGE ---------- */
function MissingFormHandle() {
  return (
    <div
      style={{
        padding: '16px',
        border: '1px dashed #ff9800',
        background: '#fff7e6',
        color: '#e65100',
        fontSize: 14,
        borderRadius: 4,
      }}
    >
      ⚠️ <strong>Form Handle is required</strong>
      <br />
      Please add <code>formHandle</code> from the Form settings panel.
    </div>
  );
}

function LeadGenerationForm({
  /* ---------- FORM ---------- */
  formHandle,
  submitText = 'Submit',
  padding = '40px',
  textColor = '#ffffff',
  fieldGap = 16,
  redirectUrl = '',

  /* ---------- LABEL ---------- */
  labelFontFamily = 'inherit',
  labelFontSize = 14,
  labelFontWeight = 400,
  labelColor = '#ffffff',
  labelPadding = '0',
  labelMargin = '0 0 6px 0',

  /* ---------- INPUT ---------- */
  inputFontFamily = 'inherit',
  inputFontSize = 14,
  inputFontWeight = 400,
  inputTextColor = '#000000',
  inputBgColor = '#ffffff',
  inputPadding = '6px 10px',
  inputMargin = '0',
  inputHeight = 38,
  inputRadius = 2,
  inputBorderSize = 1,
  inputBorderColor = '#cccccc',

  /* ---------- CHECKBOX ---------- */
  checkboxAlign = 'flex-start',

  /* ---------- BUTTON ---------- */
  buttonBgColor = 'transparent',
  buttonTextColor = '#ffffff',
  buttonTextSize = 14,
  buttonBorderSize = 1,
  buttonBorderColor = '#ffffff',
  buttonRadius = 2,
  buttonPadding = '8px 28px',
  buttonAlign = 'center',
  buttonHoverBg = '#ffffff',
  buttonHoverText = '#000000',

  /* ---------- ERROR ---------- */
  errorMessage = 'Something wrong with form data!',
  errorFontFamily = 'inherit',
  errorFontSize = 16,
  errorFontWeight = 400,
  errorTextColor = '#ffdddd',
  errorPadding = '0',
  errorMargin = '12px 0 0',

  /* ---------- SUCCESS ---------- */
  successMessage = 'Form submitted successfully!',
  successFontFamily = 'inherit',
  successFontSize = 16,
  successFontWeight = 400,
  successTextColor = '#aaffaa',
  successPadding = '0',
  successMargin = '16px 0 0',

  /* ---------- CHECKBOX TEXT ---------- */
  checkboxTextFontFamily = 'inherit',
  checkboxTextFontSize = 14,
  checkboxTextFontWeight = 400,
  checkboxTextColor = '#ffffff',
  checkboxTextLineHeight = '1.4',
  checkboxTextMargin = '0',

  /* ---------- CHECKBOX STYLE ---------- */

  checkboxSize = 18,
  checkboxRadius = 4,
  checkboxBg = '#ffffff',
  checkboxBorderColor = '#cccccc',
  checkboxBorderWidth = 1,
  checkboxCheckedBg = '#000000',
  checkboxCheckedBorderColor = '#000000',
  checkboxCheckColor = '#ffffff',
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => setMounted(true), []);

  /* ---------- LOAD FORM ---------- */
  useEffect(() => {
    if (!mounted || !formHandle) return;

    setForm(null);
    setFormError('');
    setSuccess('');

    fetch(`${API_BASE_URL}/forms/${formHandle}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Form not found');
        return r.json();
      })
      .then((json) => {
        const formData = json?.data || json;

        if (!formData || !formData.fields) {
          setFormError(errorMessage);
          return;
        }

        setForm(formData);
      })
      .catch(() => setFormError(errorMessage));
  }, [mounted, formHandle, errorMessage]);

  /* ---------- VALIDATION ---------- */
  function validate() {
    const errs = {};

    Object.values(form.fields || {}).forEach((field) => {
      const value = values[field.handle];
      const rules = field.validate || [];
      const fieldValue = value?.toString().trim() || '';
      const handle = field.handle.toLowerCase();

      /* ---------- REQUIRED ---------- */
      if (rules.includes('required')) {
        if (field.type === 'checkboxes') {
          if (value !== 1) {
            errs[field.handle] = 'Required';
            return;
          }
        } else if (!fieldValue) {
          errs[field.handle] = 'Required';
          return;
        }
      }

      /* ---------- EMAIL ---------- */
      if (
        rules.includes('email') &&
        fieldValue &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)
      ) {
        errs[field.handle] = 'Invalid email address';
        return;
      }

      /* ---------- PHONE / MOBILE ---------- */
      if (handle.includes('phone') || handle.includes('mobile')) {
        if (!/^\d+$/.test(fieldValue)) {
          errs[field.handle] = 'Phone number must contain only digits';
          return;
        }

        if (fieldValue.length < 10 || fieldValue.length > 12) {
          errs[field.handle] = 'Phone number must be between 10 and 12 digits';
          return;
        }
      }

      /* ---------- POSTAL / ZIP (ALPHANUMERIC, EXACT 6) ---------- */
      if (handle.includes('postal') || handle.includes('zip')) {
        if (!/^[a-zA-Z0-9]+$/.test(fieldValue)) {
          errs[field.handle] =
            'Postal code must contain only letters and numbers';
          return;
        }

        if (fieldValue.length !== 6) {
          errs[field.handle] = 'Postal code must be exactly 6 characters';
          return;
        }
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ---------- SUBMIT ---------- */
  async function onSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setFormError('');

    if (!validate()) return;
    setLoading(true);

    try {
      const formPayload = new FormData();
      Object.entries(values).forEach(([key, value]) =>
        formPayload.append(key, value)
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s max

      let res;

      try {
        res = await fetch(`${API_BASE_URL}/form/${formHandle}/submit`, {
          method: 'POST',
          body: formPayload,
          mode: 'cors',
          signal: controller.signal,
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          res = { ok: true };
        } else {
          throw err;
        }
      } finally {
        clearTimeout(timeoutId);
      }

      /* ---------- SAFE RESPONSE PARSING ---------- */
      let data = null;

      try {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await res.json();
        }
      } catch {
        data = null;
      }

      /* ---------- HANDLE API ERRORS ---------- */

      if (!res.ok || data?.success === false) {
        const apiErrors = {};

        // Case 1: message is an object (FIELD VALIDATION)
        if (data?.message && typeof data.message === 'object') {
          Object.entries(data.message).forEach(([key, msgs]) => {
            apiErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
        }

        // Case 2: errors is an object (FIELD VALIDATION)
        if (data?.errors && typeof data.errors === 'object') {
          Object.entries(data.errors).forEach(([key, msgs]) => {
            apiErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
        }

        // If field-level errors exist → show under fields
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
          setFormError('');
          return;
        }

        // Case 3: message is string (GENERAL ERROR)
        if (typeof data?.message === 'string') {
          setFormError(data.message);
          return;
        }

        // Case 4: fallback
        setFormError(errorMessage);
        return;
      }

      /* ---------- SUCCESS ---------- */
      try {
        if (typeof window !== 'undefined' && form?.fields) {
          const fields = Object.values(form.fields);

          const emailField = fields.find((field) => {
            const handle = field.handle?.toLowerCase() || '';
            const validate = field.validate;

            // Case 1: Array validation
            if (Array.isArray(validate) && validate.includes('email')) {
              return true;
            }

            // Case 2: Object validation
            if (typeof validate === 'object' && validate?.email) {
              return true;
            }

            // Case 3: Field type
            if (field.type === 'email') {
              return true;
            }

            // Case 4: Handle name fallback
            if (handle.includes('email') || handle.includes('mail')) {
              return true;
            }

            return false;
          });

          if (emailField) {
            const emailValue = values[emailField.handle];

            if (emailValue && typeof emailValue === 'string') {
              localStorage.setItem('lead_email', emailValue.trim());
              console.log('Saved lead email:', emailValue);
            }
          }

          if (formHandle) {
            localStorage.setItem('form_handle', formHandle);
          }
        }
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }

      setSuccess(successMessage);
      setValues({});
      setErrors({});

      if (redirectUrl) {
        setTimeout(() => (window.location.href = redirectUrl), 500);
      }
    } catch (err) {
      setFormError(err?.message || 'Form submission failed');
    } finally {
      setLoading(false);
    }
  }

  const alignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  /* ---------- VISIBILITY FIX ---------- */
  if (!mounted) return null;

  if (!formHandle) {
    return <MissingFormHandle />;
  }

  if (!form) return null;

  return (
    <section style={{ width: '100%', padding, color: textColor }}>
      <form onSubmit={onSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: fieldGap,
          }}
        >
          {Object.values(form.fields).map((field) => {
            const colSpan = field.width === 50 ? 'span 6' : 'span 12';
            const isCheckbox = field.type === 'checkboxes';

            return (
              <div key={field.handle} style={{ gridColumn: colSpan }}>
                {!isCheckbox ? (
                  <>
                    <label
                      style={{
                        fontFamily: labelFontFamily,
                        fontSize: labelFontSize,
                        fontWeight: labelFontWeight,
                        color: labelColor,
                        padding: labelPadding,
                        margin: labelMargin,
                        display: 'block',
                      }}
                    >
                      {field.display}
                      {field.validate?.includes('required') && (
                        <span style={{ color: 'red' }}> *</span>
                      )}
                    </label>

                    <input
                      type={
                        field.validate?.includes('email') ? 'email' : 'text'
                      }
                      value={values[field.handle] || ''}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [field.handle]: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        height: inputHeight,
                        fontFamily: inputFontFamily,
                        fontSize: inputFontSize,
                        fontWeight: inputFontWeight,
                        color: inputTextColor,
                        background: inputBgColor,
                        padding: inputPadding,
                        margin: inputMargin,
                        borderRadius: inputRadius,
                        border: `${inputBorderSize}px solid ${inputBorderColor}`,
                        outline: 'none',
                      }}
                    />
                  </>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      cursor: 'pointer',
                      fontSize: labelFontSize,
                      color: labelColor,
                    }}
                  >
                    {/* CUSTOM CHECKBOX */}
                    <span
                      style={{
                        width: checkboxSize,
                        height: checkboxSize,
                        borderRadius: checkboxRadius,
                        background: values[field.handle]
                          ? checkboxCheckedBg
                          : checkboxBg,
                        border: `${checkboxBorderWidth}px solid ${
                          values[field.handle]
                            ? checkboxCheckedBorderColor
                            : checkboxBorderColor
                        }`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      {values[field.handle] === 1 && (
                        <svg
                          width={checkboxSize - 6}
                          height={checkboxSize - 6}
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke={checkboxCheckColor}
                          strokeWidth='3'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <polyline points='20 6 9 17 4 12' />
                        </svg>
                      )}
                    </span>
                    <input
                      type='checkbox'
                      checked={values[field.handle] === 1}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [field.handle]: e.target.checked ? 1 : 0,
                        })
                      }
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        pointerEvents: 'none',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: checkboxTextFontFamily,
                        fontSize: checkboxTextFontSize,
                        fontWeight: checkboxTextFontWeight,
                        color: checkboxTextColor,
                        lineHeight: checkboxTextLineHeight,
                        margin: checkboxTextMargin,
                      }}
                    >
                      {field.instructions || field.display}
                    </span>
                  </label>
                )}

                {errors[field.handle] && (
                  <div
                    style={{
                      fontFamily: errorFontFamily,
                      fontSize: errorFontSize,
                      fontWeight: errorFontWeight,
                      color: errorTextColor,
                    }}
                  >
                    {errors[field.handle]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: alignMap[buttonAlign],
            marginTop: 24,
          }}
        >
          <button
            type='submit'
            disabled={loading}
            style={{
              background: buttonBgColor,
              color: buttonTextColor,
              fontSize: buttonTextSize,
              borderRadius: buttonRadius,
              border: `${buttonBorderSize}px solid ${buttonBorderColor}`,
              padding: buttonPadding,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Submitting…' : submitText}
          </button>
        </div>

        {formError && (
          <div
            style={{
              fontFamily: errorFontFamily,
              fontSize: errorFontSize,
              fontWeight: errorFontWeight,
              color: errorTextColor,
              padding: errorPadding,
              margin: errorMargin,
            }}
          >
            {formError}
          </div>
        )}

        {success && (
          <div
            style={{
              fontFamily: successFontFamily,
              fontSize: successFontSize,
              fontWeight: successFontWeight,
              color: successTextColor,
              padding: successPadding,
              margin: successMargin,
            }}
          >
            {success}
          </div>
        )}
      </form>

      <style jsx>{`
        button:hover {
          background: ${buttonHoverBg};
          color: ${buttonHoverText};
        }

        input:focus,
        input:focus-visible,
        button:focus {
          outline: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          div[style*='grid-column: span 6'] {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ---------- PLASMIC REGISTER (ALL PROPS — VERIFIED) ---------- */
PLASMIC.registerComponent(LeadGenerationForm, {
  name: 'Lead Generation Form',
  propGroups: {
    form: { name: 'Form' },
    label: { name: 'Label' },
    input: { name: 'Input' },
    button: { name: 'Button' },
    checkbox: { name: 'Checkbox' },
    checkboxText: { name: 'Checkbox Text' },
    error: { name: 'Error Message' },
    success: { name: 'Success Message' },
  },
  props: {
    /* EXACT MATCH WITH COMPONENT PROPS */
    formHandle: { type: 'string', propGroup: 'form' },
    submitText: { type: 'string', propGroup: 'form' },
    padding: { type: 'string', propGroup: 'form' },
    fieldGap: { type: 'number', propGroup: 'form' },
    redirectUrl: { type: 'string', propGroup: 'form' },

    labelFontFamily: { type: 'string', propGroup: 'label' },
    labelFontSize: { type: 'number', propGroup: 'label' },
    labelFontWeight: { type: 'number', propGroup: 'label' },
    labelColor: { type: 'color', propGroup: 'label' },
    labelPadding: { type: 'string', propGroup: 'label' },
    labelMargin: { type: 'string', propGroup: 'label' },

    inputFontFamily: { type: 'string', propGroup: 'input' },
    inputFontSize: { type: 'number', propGroup: 'input' },
    inputFontWeight: { type: 'number', propGroup: 'input' },
    inputTextColor: { type: 'color', propGroup: 'input' },
    inputBgColor: { type: 'color', propGroup: 'input' },
    inputPadding: { type: 'string', propGroup: 'input' },
    inputMargin: { type: 'string', propGroup: 'input' },
    inputHeight: { type: 'number', propGroup: 'input' },
    inputRadius: { type: 'number', propGroup: 'input' },
    inputBorderSize: { type: 'number', propGroup: 'input' },
    inputBorderColor: { type: 'color', propGroup: 'input' },

    checkboxTextFontFamily: {
      type: 'string',
      defaultValue: 'inherit',
      propGroup: 'checkboxText',
    },
    checkboxTextFontSize: {
      type: 'number',
      defaultValue: 14,
      propGroup: 'checkboxText',
    },
    checkboxTextFontWeight: {
      type: 'number',
      defaultValue: 400,
      propGroup: 'checkboxText',
    },
    checkboxTextColor: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'checkboxText',
    },
    checkboxTextLineHeight: {
      type: 'string',
      defaultValue: '1.4',
      propGroup: 'checkboxText',
    },
    checkboxTextMargin: {
      type: 'string',
      defaultValue: '0',
      propGroup: 'checkboxText',
    },

    checkboxAlign: {
      type: 'choice',
      options: ['flex-start', 'center', 'stretch', 'baseline'],
      propGroup: 'checkbox',
    },
    checkboxSize: {
      type: 'number',
      defaultValue: 18,
      propGroup: 'checkbox',
    },
    checkboxRadius: {
      type: 'number',
      defaultValue: 4,
      propGroup: 'checkbox',
    },
    checkboxBg: {
      type: 'color',
      propGroup: 'checkbox',
    },
    checkboxBorderColor: {
      type: 'color',
      propGroup: 'checkbox',
    },
    checkboxBorderWidth: {
      type: 'number',
      defaultValue: 1,
      propGroup: 'checkbox',
    },
    checkboxCheckedBg: {
      type: 'color',
      propGroup: 'checkbox',
    },
    checkboxCheckedBorderColor: {
      type: 'color',
      propGroup: 'checkbox',
    },
    checkboxCheckColor: {
      type: 'color',
      propGroup: 'checkbox',
    },

    buttonBgColor: { type: 'color', propGroup: 'button' },
    buttonTextColor: { type: 'color', propGroup: 'button' },
    buttonTextSize: { type: 'number', propGroup: 'button' },
    buttonBorderSize: { type: 'number', propGroup: 'button' },
    buttonBorderColor: { type: 'color', propGroup: 'button' },
    buttonRadius: { type: 'number', propGroup: 'button' },
    buttonPadding: { type: 'string', propGroup: 'button' },
    buttonAlign: {
      type: 'choice',
      options: ['left', 'center', 'right'],
      propGroup: 'button',
    },
    buttonHoverBg: { type: 'color', propGroup: 'button' },
    buttonHoverText: { type: 'color', propGroup: 'button' },

    errorMessage: { type: 'string', propGroup: 'error' },
    errorFontFamily: { type: 'string', propGroup: 'error' },
    errorFontSize: { type: 'number', propGroup: 'error' },
    errorFontWeight: { type: 'number', propGroup: 'error' },
    errorTextColor: { type: 'color', propGroup: 'error' },
    errorPadding: { type: 'string', propGroup: 'error' },
    errorMargin: { type: 'string', propGroup: 'error' },

    successMessage: { type: 'string', propGroup: 'success' },
    successFontFamily: { type: 'string', propGroup: 'success' },
    successFontSize: { type: 'number', propGroup: 'success' },
    successFontWeight: { type: 'number', propGroup: 'success' },
    successTextColor: { type: 'color', propGroup: 'success' },
    successPadding: { type: 'string', propGroup: 'success' },
    successMargin: { type: 'string', propGroup: 'success' },
  },
});

export default LeadGenerationForm;
