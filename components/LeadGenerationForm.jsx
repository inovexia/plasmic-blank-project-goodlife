'use client';

import { useEffect, useState } from 'react';
import { PLASMIC } from '../plasmic-init';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

    fetch(`${API_BASE_URL}/forms`)
      .then((r) => r.json())
      .then((json) => {
        const selected = json?.data?.find((f) => f.handle === formHandle);
        if (!selected) {
          setFormError(errorMessage);
          return;
        }
        setForm(selected);
      })
      .catch(() => setFormError(errorMessage));
  }, [mounted, formHandle, errorMessage]);

  /* ---------- VALIDATION ---------- */
  function validate() {
    const errs = {};
    Object.values(form.fields || {}).forEach((field) => {
      const value = values[field.handle];
      const rules = field.validate || [];

      if (rules.includes('required')) {
        if (field.type === 'checkboxes') {
          if (value !== 1) errs[field.handle] = 'Required';
        } else if (!value?.trim()) {
          errs[field.handle] = 'Required';
        }
      }

      if (
        rules.includes('email') &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ) {
        errs[field.handle] = 'Invalid email';
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
      Object.entries(values).forEach(([key, value]) => {
        formPayload.append(key, value);
      });

      const res = await fetch(`${API_BASE_URL}/form/${formHandle}/submit`, {
        method: 'POST',
        body: formPayload,
        mode: 'cors',
      });

      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;

      if (!res.ok || data?.success === false) {
        setFormError(errorMessage);
        return;
      }

      setSuccess(successMessage);
      setValues({});
      setErrors({});

      if (redirectUrl) {
        setTimeout(() => (window.location.href = redirectUrl), 500);
      }
    } catch {
      setFormError('Form submission failed');
    } finally {
      setLoading(false);
    }
  }

  const alignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  if (!mounted || !form) return null;

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
                      alignItems: checkboxAlign,
                      gap: 10,
                      fontFamily: labelFontFamily,
                      fontSize: labelFontSize,
                      color: labelColor,
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={values[field.handle] === 1}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [field.handle]: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <span>{field.instructions || field.display}</span>
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

/* ---------- PLASMIC REGISTER (ALL PROPS) ---------- */
PLASMIC.registerComponent(LeadGenerationForm, {
  name: 'Lead Generation Form',

  propGroups: {
    form: { name: 'Form' },
    label: { name: 'Label' },
    input: { name: 'Input' },
    button: { name: 'Button' },
    checkbox: { name: 'Checkbox' },
    error: { name: 'Error Message' },
    success: { name: 'Success Message' },
  },

  props: {
    /* ---------- FORM ---------- */
    formHandle: {
      type: 'string',
      defaultValue: 'demo_lead_form', // 🔑 REQUIRED FOR VISIBILITY
      propGroup: 'form',
    },
    submitText: {
      type: 'string',
      defaultValue: 'Submit',
      propGroup: 'form',
    },
    padding: {
      type: 'string',
      defaultValue: '40px',
      propGroup: 'form',
    },
    fieldGap: {
      type: 'number',
      defaultValue: 16,
      propGroup: 'form',
    },
    redirectUrl: {
      type: 'string',
      defaultValue: '',
      propGroup: 'form',
    },

    /* ---------- LABEL ---------- */
    labelFontFamily: {
      type: 'string',
      defaultValue: 'inherit',
      propGroup: 'label',
    },
    labelFontSize: {
      type: 'number',
      defaultValue: 14,
      propGroup: 'label',
    },
    labelFontWeight: {
      type: 'number',
      defaultValue: 400,
      propGroup: 'label',
    },
    labelColor: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'label',
    },
    labelPadding: {
      type: 'string',
      defaultValue: '0',
      propGroup: 'label',
    },
    labelMargin: {
      type: 'string',
      defaultValue: '0 0 6px 0',
      propGroup: 'label',
    },

    /* ---------- INPUT ---------- */
    inputFontFamily: {
      type: 'string',
      defaultValue: 'inherit',
      propGroup: 'input',
    },
    inputFontSize: {
      type: 'number',
      defaultValue: 14,
      propGroup: 'input',
    },
    inputFontWeight: {
      type: 'number',
      defaultValue: 400,
      propGroup: 'input',
    },
    inputTextColor: {
      type: 'color',
      defaultValue: '#000000',
      propGroup: 'input',
    },
    inputBgColor: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'input',
    },
    inputPadding: {
      type: 'string',
      defaultValue: '6px 10px',
      propGroup: 'input',
    },
    inputMargin: {
      type: 'string',
      defaultValue: '0',
      propGroup: 'input',
    },
    inputHeight: {
      type: 'number',
      defaultValue: 38,
      propGroup: 'input',
    },
    inputRadius: {
      type: 'number',
      defaultValue: 2,
      propGroup: 'input',
    },
    inputBorderSize: {
      type: 'number',
      defaultValue: 1,
      propGroup: 'input',
    },
    inputBorderColor: {
      type: 'color',
      defaultValue: '#cccccc',
      propGroup: 'input',
    },

    /* ---------- CHECKBOX ---------- */
    checkboxAlign: {
      type: 'choice',
      options: ['flex-start', 'center'],
      defaultValue: 'flex-start',
      propGroup: 'checkbox',
    },

    /* ---------- BUTTON ---------- */
    buttonBgColor: {
      type: 'color',
      defaultValue: 'transparent',
      propGroup: 'button',
    },
    buttonTextColor: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'button',
    },
    buttonTextSize: {
      type: 'number',
      defaultValue: 14,
      propGroup: 'button',
    },
    buttonBorderSize: {
      type: 'number',
      defaultValue: 1,
      propGroup: 'button',
    },
    buttonBorderColor: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'button',
    },
    buttonRadius: {
      type: 'number',
      defaultValue: 2,
      propGroup: 'button',
    },
    buttonPadding: {
      type: 'string',
      defaultValue: '8px 28px',
      propGroup: 'button',
    },
    buttonAlign: {
      type: 'choice',
      options: ['left', 'center', 'right'],
      defaultValue: 'center',
      propGroup: 'button',
    },
    buttonHoverBg: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'button',
    },
    buttonHoverText: {
      type: 'color',
      defaultValue: '#000000',
      propGroup: 'button',
    },

    /* ---------- ERROR ---------- */
    errorMessage: {
      type: 'string',
      defaultValue: 'Something wrong with form data!',
      propGroup: 'error',
    },
    errorFontFamily: {
      type: 'string',
      defaultValue: 'inherit',
      propGroup: 'error',
    },
    errorFontSize: {
      type: 'number',
      defaultValue: 16,
      propGroup: 'error',
    },
    errorFontWeight: {
      type: 'number',
      defaultValue: 400,
      propGroup: 'error',
    },
    errorTextColor: {
      type: 'color',
      defaultValue: '#ffdddd',
      propGroup: 'error',
    },
    errorPadding: {
      type: 'string',
      defaultValue: '0',
      propGroup: 'error',
    },
    errorMargin: {
      type: 'string',
      defaultValue: '12px 0 0',
      propGroup: 'error',
    },

    /* ---------- SUCCESS ---------- */
    successMessage: {
      type: 'string',
      defaultValue: 'Form submitted successfully!',
      propGroup: 'success',
    },
    successFontFamily: {
      type: 'string',
      defaultValue: 'inherit',
      propGroup: 'success',
    },
    successFontSize: {
      type: 'number',
      defaultValue: 16,
      propGroup: 'success',
    },
    successFontWeight: {
      type: 'number',
      defaultValue: 400,
      propGroup: 'success',
    },
    successTextColor: {
      type: 'color',
      defaultValue: '#aaffaa',
      propGroup: 'success',
    },
    successPadding: {
      type: 'string',
      defaultValue: '0',
      propGroup: 'success',
    },
    successMargin: {
      type: 'string',
      defaultValue: '16px 0 0',
      propGroup: 'success',
    },
  },
});


export default LeadGenerationForm;
