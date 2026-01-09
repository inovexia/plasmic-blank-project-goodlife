'use client';

import { useEffect, useState } from 'react';
import { PLASMIC } from '../plasmic-init';

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

    fetch('https://imgen3.dev.developer1.website/api/forms') // keep loading form metadata from external API
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
        if (field.type === 'checkboxes' ? !value : !value?.trim()) {
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
        formPayload.append(key, value);
      });

      const apiUrl = `https://imgen3.dev.developer1.website/!/forms/${formHandle}`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formPayload,
        mode: 'cors',
      });

      if (!res.ok) {
        throw new Error('Form submission failed');
      }

      setSuccess(successMessage);
      setValues({});
      setErrors({});
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Form submission failed');
    } finally {
      setLoading(false);
    }
  }



  // helper function to read cookies if needed
  function getCookie(name) {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    if (match) return match[2];
    return null;
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
                      checked={!!values[field.handle]}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [field.handle]: e.target.checked,
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
    formSettings: {
      name: 'Form Settings',
    },
    inputSettings: {
      name: 'Input Field Settings',
    },
    buttonSettings: {
      name: 'Button Style',
    },
  },

  props: {
    /* ---------- FORM SETTINGS ---------- */
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
    padding: {
      type: 'string',
      defaultValue: '40px',
      propGroup: 'formSettings',
    },

    /* ---------- INPUT FIELD SETTINGS ---------- */
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

    /* ---------- BUTTON SETTINGS ---------- */
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
