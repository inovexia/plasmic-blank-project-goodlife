'use client';

import { useEffect, useState } from 'react';
import { PLASMIC } from '../plasmic-init';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function LeadGenerationForm({
  formHandle,
  submitText = 'Submit',

  padding = '40px',
  textColor = '#ffffff',

  fieldGap = 16,

  labelColor = '#ffffff',
  labelFontSize = 14,

  inputHeight = 38,
  inputPadding = '6px 10px',
  inputRadius = 2,

  buttonTextColor = '#ffffff',
  buttonBorderColor = '#ffffff',
  buttonPadding = '8px 28px',
  buttonAlign = 'center',

  errorMessage = 'Something wrong with form data!',
  successMessage = 'Form submitted successfully!',

  errorTextColor = '#ffdddd',
  errorFontSize = 16,

  redirectUrl = '',
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => setMounted(true), []);

  // ---------------- LOAD FORM ----------------
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
      .catch(() => {
        setFormError(errorMessage);
      });
  }, [mounted, formHandle, errorMessage]);

  // ---------------- VALIDATION ----------------
  function validate() {
    const errs = {};

    Object.values(form.fields || {}).forEach((field) => {
      const value = values[field.handle];
      const rules = field.validate || [];

      if (rules.includes('required')) {
        if (field.type === 'checkboxes') {
          if (value !== 1) errs[field.handle] = 'Required';
        } else {
          if (!value?.trim()) errs[field.handle] = 'Required';
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

  // ---------------- SUBMIT ----------------
 async function onSubmit(e) {
   e.preventDefault();

   setSuccess('');
   setFormError('');

   if (!validate()) return;

   setLoading(true);

   try {
     const formPayload = new FormData();

     Object.entries(values).forEach(([key, value]) => {
       if (key === 'acceptance' || key === 'agreement') {
         formPayload.append(key, value === 1 ? '1' : '0');
       } else {
         formPayload.append(key, value);
       }
     });

     const res = await fetch(`${API_BASE_URL}/form/${formHandle}/submit`, {
       method: 'POST',
       body: formPayload,
       mode: 'cors',
     });

     // ✅ SAFE RESPONSE PARSING
     const rawText = await res.text();
     let data = null;

     try {
       data = rawText ? JSON.parse(rawText) : null;
     } catch {
       data = rawText;
     }

     if (!res.ok || data?.success === false) {
       let message = errorMessage;

       // STRING ERROR
       if (typeof data === 'string') {
         message = data;
       }

       // OBJECT ERROR
       else if (data?.message) {
         if (typeof data.message === 'string') {
           message = data.message;
         } else if (typeof data.message === 'object') {
           const first = Object.values(data.message)[0];
           message = Array.isArray(first) ? first[0] : first;
         }
       }

       setFormError(message);
       return;
     }

     // ✅ SAVE EMAIL TO localStorage
     const emailField = Object.values(form.fields).find((f) =>
       f.validate?.includes('email')
     );
     if (emailField && values[emailField.handle]) {
       localStorage.setItem('lead_email', values[emailField.handle]);
     }

     setSuccess(successMessage);
     setValues({});
     setErrors({});

     if (redirectUrl) {
       setTimeout(() => {
         window.location.href = redirectUrl;
       }, 500);
     }
   } catch (err) {
     console.error(err);
     setFormError('Form submission failed');
   } finally {
     setLoading(false);
   }
 }


  const buttonAlignmentMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  if (!mounted) return null;

  if (formError && !form) {
    return (
      <section style={{ padding, color: textColor }}>
        <div style={{ margin: 'auto', color: 'red' }}>{formError}</div>
      </section>
    );
  }

  if (!form) return null;

  return (
    <section style={{ width: '100%', padding, color: textColor }}>
      <form style={{ margin: 'auto' }} onSubmit={onSubmit}>
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
                        display: 'block',
                        marginBottom: 6,
                        color: labelColor,
                        fontSize: labelFontSize,
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
                        padding: inputPadding,
                        borderRadius: inputRadius,
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                      }}
                    />
                  </>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      gap: 10,
                      fontSize: labelFontSize,
                      color: labelColor,
                      alignItems: 'flex-start',
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
                  <div style={{ color: '#ffdddd', fontSize: 12 }}>
                    {errors[field.handle]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SUBMIT */}
        <div
          style={{
            display: 'flex',
            justifyContent: buttonAlignmentMap[buttonAlign],
            marginTop: 24,
          }}
        >
          <button
            type='submit'
            disabled={loading}
            style={{
              background: 'transparent',
              color: buttonTextColor,
              border: `1px solid ${buttonBorderColor}`,
              padding: buttonPadding,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Submitting…' : submitText}
          </button>
        </div>

        {/* ERROR MESSAGE BELOW BUTTON */}
        {formError && (
          <div
            style={{
              marginTop: 12,
              color: errorTextColor,
              fontSize: errorFontSize,
            }}
          >
            {formError}
          </div>
        )}

        {success && (
          <div style={{ marginTop: 16, color: '#aaffaa' }}>{success}</div>
        )}
      </form>

      <style jsx>{`
        input:focus,
        input:focus-visible,
        input:active,
        button:focus,
        button:focus-visible,
        button:active {
          outline: none !important;
          box-shadow: none !important;
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

PLASMIC.registerComponent(LeadGenerationForm, {
  name: 'Lead Generation Form',

  propGroups: {
    formSettings: { name: 'Form Settings' },
    inputSettings: { name: 'Input Field Settings' },
    buttonSettings: { name: 'Button Style' },
  },

  props: {
    formHandle: {
      type: 'string',
      defaultValue: 'redstripe_metro_lead_form_2025',
      propGroup: 'formSettings',
    },
    errorMessage: {
      type: 'string',
      defaultValue: 'Something wrong with form API',
      propGroup: 'formSettings',
    },
    successMessage: {
      type: 'string',
      defaultValue: 'Form submitted successfully!',
      propGroup: 'formSettings',
    },
    errorTextColor: {
      type: 'color',
      defaultValue: '#ffdddd',
      propGroup: 'formSettings',
    },
    errorFontSize: {
      type: 'number',
      defaultValue: 16,
      propGroup: 'formSettings',
    },
    redirectUrl: {
      type: 'string',
      defaultValue: '',
      propGroup: 'formSettings',
    },
    padding: {
      type: 'string',
      defaultValue: '40px',
      propGroup: 'formSettings',
    },
    inputRadius: {
      type: 'number',
      defaultValue: 5,
      propGroup: 'inputSettings',
    },
    inputHeight: {
      type: 'number',
      defaultValue: 38,
      propGroup: 'inputSettings',
    },
    labelColor: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'inputSettings',
    },
    fieldGap: {
      type: 'number',
      defaultValue: 16,
      propGroup: 'inputSettings',
    },
    submitText: {
      type: 'string',
      defaultValue: 'Submit',
      propGroup: 'buttonSettings',
    },
    buttonTextColor: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'buttonSettings',
    },
    buttonBorderColor: {
      type: 'color',
      defaultValue: '#ffffff',
      propGroup: 'buttonSettings',
    },
    buttonPadding: {
      type: 'string',
      defaultValue: '8px 28px',
      propGroup: 'buttonSettings',
    },
    buttonAlign: {
      type: 'choice',
      options: ['left', 'center', 'right'],
      defaultValue: 'center',
      propGroup: 'buttonSettings',
    },
  },
});

export default LeadGenerationForm;
