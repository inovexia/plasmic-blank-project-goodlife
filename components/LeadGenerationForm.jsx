'use client';

import { useEffect, useState } from 'react';
import { PLASMIC } from '../plasmic-init';

export default function LeadGenerationForm({
  formHandle,
  submitText = 'Submit',
}) {
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      setLoading(true);
      const res = await fetch('https://dev.imgen3.dev1.co.in/api/forms');
      const json = await res.json();

      const selected = json.data.find((f) => f.handle === formHandle);

      setForm(selected || null);
      setLoading(false);
    }

    if (formHandle) loadForm();
  }, [formHandle]);

  if (loading) return <p>Loading form…</p>;
  if (!form) return <p>Form not found</p>;

  // ---------------- Validation ----------------
  function validate() {
    const newErrors = {};

    Object.values(form.fields).forEach((field) => {
      const value = values[field.handle];

      if (field.validate?.includes('required') && !value) {
        newErrors[field.handle] = 'Required';
      }

      if (
        field.validate?.includes('email') &&
        value &&
        !/^\S+@\S+\.\S+$/.test(value)
      ) {
        newErrors[field.handle] = 'Invalid email';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ---------------- Submit ----------------
  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    await fetch(form.api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    alert('Form submitted');
  }

  // ---------------- Render ----------------
  return (
    <form onSubmit={onSubmit} className='lead-form'>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {Object.values(form.fields).map((field) => {
          const width = field.width === 50 ? '50%' : '100%';

          return (
            <div key={field.handle} style={{ width }}>
              {field.type !== 'checkboxes' && (
                <>
                  <label>
                    {field.display}
                    {field.validate?.includes('required') && ' *'}
                  </label>

                  <input
                    type='text'
                    value={values[field.handle] || ''}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        [field.handle]: e.target.value,
                      })
                    }
                  />
                </>
              )}

              {field.type === 'checkboxes' && (
                <label>
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
                  {field.instructions || field.display}
                </label>
              )}

              {errors[field.handle] && (
                <div style={{ color: 'red', fontSize: 12 }}>
                  {errors[field.handle]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button type='submit'>{submitText}</button>
    </form>
  );
}


// Register this component

PLASMIC.registerComponent(require('./LeadGenerationForm').default, {
  name: 'Lead Generation Form',
  props: {
    formHandle: {
      type: 'string',
      displayName: 'Form Handle',
      defaultValue: 'toronto_water_front',
    },
    submitText: {
      type: 'string',
      defaultValue: 'Submit',
    },
  },
});
