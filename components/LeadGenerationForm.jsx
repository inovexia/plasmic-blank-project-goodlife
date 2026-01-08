'use client';

import { useEffect, useState } from 'react';
import { PLASMIC } from '../plasmic-init';

function LeadGenerationForm({
  formHandle,
  submitText = 'Submit',

  padding = '40px',
  textColor = '#fff',

  fieldGap = 16,

  labelColor = '#fff',
  labelFontSize = 14,

  inputHeight = 38,
  inputPadding = '6px 10px',
  inputRadius = 2,

  buttonTextColor = '#fff',
  buttonBorderColor = '#fff',
  buttonPadding = '8px 28px',
  buttonAlign = 'left', // left | center | right

  errorMessage = 'Something wrong with form data!',
}) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState(false);

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !formHandle) return;

    setLoading(true);
    setForm(null);
    setFormError(false);

    fetch('https://dev.imgen3.dev1.co.in/api/forms')
      .then((r) => {
        if (!r.ok) throw new Error('API failed');
        return r.json();
      })
      .then((json) => {
        const selected = json?.data?.find((f) => f.handle === formHandle);

        if (
          !selected ||
          !selected.fields ||
          Object.keys(selected.fields).length === 0
        ) {
          setFormError(true);
          setLoading(false);
          return;
        }

        setForm(selected);
        setLoading(false);
      })
      .catch(() => {
        setFormError(true);
        setLoading(false);
      });
  }, [mounted, formHandle]);

  function validate() {
    const errs = {};

    Object.values(form.fields).forEach((field) => {
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

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    fetch(form.api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
  }

  // ⏳ Loading (do nothing)
  if (loading) return null;

  // ❌ Error state
  if (formError) {
    return (
      <section style={{ padding, color: textColor }}>
        <div
          style={{
            maxWidth: 900,
            margin: 'auto',
            textAlign: 'center',
            color: '#ffdddd',
            fontSize: 16,
          }}
        >
          {errorMessage}
        </div>
      </section>
    );
  }

  if (!form) return null;

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <section style={{ padding, color: textColor }}>
      <form style={{ maxWidth: 900, margin: 'auto' }} onSubmit={onSubmit}>
        {/* GRID */}
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
                      lineHeight: 1.4,
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
                      style={{ marginTop: 4 }}
                    />
                    <span>{field.instructions || field.display}</span>
                  </label>
                )}

                {errors[field.handle] && (
                  <div
                    style={{
                      color: '#ffdddd',
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {errors[field.handle]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BUTTON */}
        <div
          style={{
            display: 'flex',
            justifyContent: justifyMap[buttonAlign],
          }}
        >
          <button
            type='submit'
            style={{
              marginTop: 24,
              background: 'transparent',
              color: buttonTextColor,
              border: `1px solid ${buttonBorderColor}`,
              padding: buttonPadding,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {submitText}
          </button>
        </div>
      </form>

      {/* RESPONSIVE + REMOVE FOCUS */}
      <style jsx>{`
        input:focus,
        input:focus-visible,
        button:focus,
        button:focus-visible {
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

/* 🔌 PLASMIC REGISTRATION */
PLASMIC.registerComponent(LeadGenerationForm, {
  name: 'Lead Generation Form',
  props: {
    formHandle: { type: 'string', defaultValue: 'toronto_water_front' },
    submitText: { type: 'string', defaultValue: 'Submit' },

    padding: { type: 'string', defaultValue: '40px' },
    textColor: { type: 'color', defaultValue: '#ffffff' },

    fieldGap: { type: 'number', defaultValue: 16 },

    labelColor: { type: 'color', defaultValue: '#ffffff' },
    labelFontSize: { type: 'number', defaultValue: 14 },

    inputHeight: { type: 'number', defaultValue: 38 },
    inputPadding: { type: 'string', defaultValue: '6px 10px' },
    inputRadius: { type: 'number', defaultValue: 2 },

    buttonTextColor: { type: 'color', defaultValue: '#ffffff' },
    buttonBorderColor: { type: 'color', defaultValue: '#ffffff' },
    buttonPadding: { type: 'string', defaultValue: '8px 28px' },
    buttonAlign: {
      type: 'choice',
      options: ['left', 'center', 'right'],
      defaultValue: 'left',
    },

    errorMessage: {
      type: 'string',
      defaultValue: 'Something wrong with form data!',
    },
  },
});

export default LeadGenerationForm;
