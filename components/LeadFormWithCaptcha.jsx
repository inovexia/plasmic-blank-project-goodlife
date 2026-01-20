'use client';

import { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { PLASMIC } from '../plasmic-init';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------- FALLBACK CAPTCHA GENERATOR ---------- */
function generateCaptcha(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/* ---------- GET UTM DATA ---------- */
function getUtmData() {
  try {
    const stored = localStorage.getItem('utm_last_touch') 
      || localStorage.getItem('utm_first_touch');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

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

function LeadFormWithCaptcha({
  /* ---------- FORM ---------- */
  formHandle,
  submitText = 'Submit',
  padding = '40px',
  textColor = '#ffffff',
  fieldGap = 16,
  redirectUrl = '',

  /* ---------- RECAPTCHA ---------- */
  enableRecaptcha = true,
  enableFallbackCaptcha = false,
  recaptchaVersion = 'v2',
  recaptchaSiteKey = '',
  recaptchaAlign = 'left',

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
  const [isMobile, setIsMobile] = useState(false);

  /* ---------- CAPTCHA STATE ---------- */
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [fallbackCode, setFallbackCode] = useState('');
  const [fallbackInput, setFallbackInput] = useState('');
  const recaptchaRef = useRef(null);
  const submitEventRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setFallbackCode(generateCaptcha());
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  /* ---------- CAPTCHA HANDLER ---------- */
  async function onRecaptchaVerify(token) {
    if (!token) return;

    try {
      const res = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          version: recaptchaVersion,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCaptchaVerified(true);
        setPendingSubmit(false);

        // Continue submit after v3 verification
        if (recaptchaVersion === 'v3' && submitEventRef.current) {
          doSubmit();
        }
      } else {
        setCaptchaVerified(false);
        setPendingSubmit(false);
        alert('Captcha verification failed. Try again.');
        recaptchaRef.current?.reset();
      }
    } catch (err) {
      console.error('Captcha verify error', err);
      setCaptchaVerified(false);
      setPendingSubmit(false);
      recaptchaRef.current?.reset();
    }
  }


  function verifyFallbackCaptcha() {
    if (fallbackInput.toUpperCase() === fallbackCode) {
      setCaptchaVerified(true);
    } else {
      setCaptchaVerified(false);
      setFallbackCode(generateCaptcha());
      setFallbackInput('');
      alert('Captcha incorrect. Try again.');
    }
  }

  /* ---------- VALIDATION ---------- */
  function validate() {
    const errs = {};
    Object.values(form.fields || {}).forEach((field) => {
      const value = values[field.handle];
      const rules = field.validate || [];
      const fieldValue = value?.toString().trim() || '';
      const handle = field.handle.toLowerCase();

      if (rules.includes('required')) {
        if (field.type === 'checkboxes') {
          if (value !== 1) errs[field.handle] = 'Required';
        } else if (!fieldValue) errs[field.handle] = 'Required';
      }

      if (
        rules.includes('email') &&
        fieldValue &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)
      ) {
        errs[field.handle] = 'Invalid email address';
      }

      if (handle.includes('phone') || handle.includes('mobile')) {
        if (!/^\d+$/.test(fieldValue))
          errs[field.handle] = 'Phone number must contain only digits';
        if (fieldValue.length < 10 || fieldValue.length > 12)
          errs[field.handle] = 'Phone number must be between 10 and 12 digits';
      }

      if (handle.includes('postal') || handle.includes('zip')) {
        if (!/^[a-zA-Z0-9]+$/.test(fieldValue))
          errs[field.handle] =
            'Postal code must contain only letters and numbers';
        if (fieldValue.length !== 6)
          errs[field.handle] = 'Postal code must be exactly 6 characters';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ---------- DO SUBMIT ---------- */
  async function doSubmit() {
    if (!validate()) return;
    setLoading(true);

    try {
      const formPayload = new FormData();
      // Append form fields
      Object.entries(values).forEach(([key, value]) => {
        formPayload.append(key, value);
      });

      // Append UTM data
      const utmData = getUtmData();
      Object.entries(utmData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formPayload.append(`${key}`, value.toString());
        }
      });

      // Object.entries(values).forEach(([key, value]) =>
      //   formPayload.append(key, value),
      // );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      let res;
      try {
        res = await fetch(`${API_BASE_URL}/form/${formHandle}/submit`, {
          method: 'POST',
          body: formPayload,
          mode: 'cors',
          signal: controller.signal,
        });
      } catch (err) {
        if (err.name === 'AbortError') res = { ok: true };
        else throw err;
      } finally {
        clearTimeout(timeoutId);
      }

      let data = null;
      try {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || data?.success === false) {
        const apiErrors = {};
        if (data?.message && typeof data.message === 'object') {
          Object.entries(data.message).forEach(([key, msgs]) => {
            apiErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
        }
        if (data?.errors && typeof data.errors === 'object') {
          Object.entries(data.errors).forEach(([key, msgs]) => {
            apiErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
        }
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
          setFormError('');
          return;
        }
        if (typeof data?.message === 'string') setFormError(data.message);
        else setFormError(errorMessage);
        return;
      }

      try {
        if (typeof window !== 'undefined') {
          const fields = Object.values(form.fields || {});

          const emailField = fields.find((field) => {
            const handle = (field.handle || '').toLowerCase();
            const rules = field.validate || [];

            const hasEmailRule = Array.isArray(rules)
              ? rules.includes('email')
              : typeof rules === 'string'
                ? rules.includes('email')
                : false;

            return hasEmailRule || handle.includes('email');
          });

          if (emailField && values[emailField.handle]) {
            localStorage.setItem(
              'lead_email',
              values[emailField.handle].toString().trim(),
            );
          }

          if (formHandle) {
            localStorage.setItem('form_handle', formHandle);
          }
        }
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }


      setSuccess(successMessage);
      setValues({});
      setErrors({});
      setCaptchaVerified(false);

      if (redirectUrl && typeof window !== 'undefined') {
        window.location.assign(redirectUrl);
      }
    } catch (err) {
      setFormError(err?.message || 'Form submission failed');
    } finally {
      setLoading(false);
    }
  }

  /* ---------- SUBMIT ---------- */
  async function onSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setFormError('');

    submitEventRef.current = e;

    // ---- V3 FLOW ----
    if (enableRecaptcha && recaptchaVersion === 'v3') {
      if (!validate()) return;

      setPendingSubmit(true);
      recaptchaRef.current?.execute();
      return;
    }

    // ---- V2 FLOW ----
    if (enableRecaptcha && recaptchaVersion === 'v2' && !captchaVerified) {
      setFormError('Please verify captcha first');
      return;
    }

    // ---- FALLBACK FLOW ----
    if (!enableRecaptcha && enableFallbackCaptcha && !captchaVerified) {
      setFormError('Please verify captcha first');
      return;
    }

    doSubmit();
  }


  const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

  if (!mounted) return null;
  if (!formHandle) return <MissingFormHandle />;
  if (!form) return null;

  return (
    <section style={{ width: '100%', padding, color: textColor }}>
      <form onSubmit={onSubmit}>
        {/* --- FORM FIELDS --- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: fieldGap,
          }}
        >
          {Object.values(form.fields).map((field) => {
            const colSpan = isMobile
              ? 'span 12'
              : field.width === 50
                ? 'span 6'
                : 'span 12';

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
                        setValues({ ...values, [field.handle]: e.target.value })
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

        {/* --- CAPTCHA --- */}
        {(enableRecaptcha || enableFallbackCaptcha) && (
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              justifyContent: alignMap[recaptchaAlign],
              alignItems: 'center',
              gap: 10,
            }}
          >
            {/* --- GOOGLE RECAPTCHA --- */}
            {enableRecaptcha && recaptchaSiteKey ? (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                size={recaptchaVersion === 'v2' ? 'normal' : 'invisible'}
                onChange={onRecaptchaVerify}
              />
            ) : null}

            {/* --- FALLBACK CAPTCHA --- */}
            {!enableRecaptcha && enableFallbackCaptcha && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Captcha Code */}
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      letterSpacing: 4,
                      background: '#f4f4f4',
                      color: '#000',
                      padding: '10px 20px',
                      userSelect: 'none',
                      fontFamily: 'monospace',
                    }}
                  >
                    {fallbackCode}
                  </div>

                  {/* Captcha Input */}
                  <input
                    placeholder='Enter captcha'
                    value={fallbackInput}
                    onChange={(e) => setFallbackInput(e.target.value)}
                    style={{ padding: 6, flex: 1 }}
                  />

                  {/* Refresh Icon */}
                  <button
                    type='button'
                    onClick={() => {
                      setFallbackCode(generateCaptcha());
                      setFallbackInput('');
                      setCaptchaVerified(false);
                      setFormError('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                    }}
                    title='Refresh captcha'
                  >
                    🔄
                  </button>

                  {/* Verify Button */}
                  <button
                    type='button'
                    onClick={verifyFallbackCaptcha}
                    style={{
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    Verify
                  </button>
                </div>

                {/* Error message below */}
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
              </div>
            )}
          </div>
        )}

        {/* --- SUBMIT BUTTON --- */}
        <div
          style={{
            display: 'flex',
            justifyContent: alignMap[buttonAlign],
            marginTop: 24,
          }}
        >
          <button
            type='submit'
            disabled={
              loading ||
              (enableRecaptcha &&
                recaptchaVersion === 'v2' &&
                !captchaVerified) ||
              (!enableRecaptcha && enableFallbackCaptcha && !captchaVerified)
            }
            style={{
              background: buttonBgColor,
              color: buttonTextColor,
              fontSize: buttonTextSize,
              borderRadius: buttonRadius,
              border: `${buttonBorderSize}px solid ${buttonBorderColor}`,
              padding: buttonPadding,
              cursor:
                loading ||
                (enableRecaptcha &&
                  recaptchaVersion === 'v2' &&
                  !captchaVerified) ||
                (!enableRecaptcha && enableFallbackCaptcha && !captchaVerified)
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {loading ? 'Submitting…' : submitText}
          </button>
        </div>

        {/* --- ERROR & SUCCESS --- */}
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
    </section>
  );
}

/* ---------- PLASMIC REGISTER (UNCHANGED) ---------- */
PLASMIC.registerComponent(LeadFormWithCaptcha, {
  name: 'Lead Form With Google Captcha',
  propGroups: {
    form: { name: 'Form' },
    recaptcha: { name: 'reCAPTCHA' },
    label: { name: 'Label' },
    input: { name: 'Input' },
    button: { name: 'Button' },
    checkbox: { name: 'Checkbox' },
    checkboxText: { name: 'Checkbox Text' },
    error: { name: 'Error Message' },
    success: { name: 'Success Message' },
  },
  props: {
    formHandle: { type: 'string', propGroup: 'form' },
    submitText: { type: 'string', propGroup: 'form' },
    padding: { type: 'string', propGroup: 'form' },
    fieldGap: { type: 'number', propGroup: 'form' },
    redirectUrl: { type: 'string', propGroup: 'form' },

    enableRecaptcha: {
      type: 'boolean',
      defaultValue: true,
      propGroup: 'recaptcha',
    },
    enableFallbackCaptcha: {
      type: 'boolean',
      defaultValue: false,
      propGroup: 'recaptcha',
    },
    recaptchaVersion: {
      type: 'choice',
      options: ['v2', 'v3'],
      defaultValue: 'v2',
      propGroup: 'recaptcha',
    },
    recaptchaSiteKey: { type: 'string', propGroup: 'recaptcha' },
    recaptchaAlign: {
      type: 'choice',
      options: ['left', 'center', 'right'],
      defaultValue: 'left',
      propGroup: 'recaptcha',
    },

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

    checkboxTextFontFamily: { type: 'string', propGroup: 'checkboxText' },
    checkboxTextFontSize: { type: 'number', propGroup: 'checkboxText' },
    checkboxTextFontWeight: { type: 'number', propGroup: 'checkboxText' },
    checkboxTextColor: { type: 'color', propGroup: 'checkboxText' },
    checkboxTextLineHeight: { type: 'string', propGroup: 'checkboxText' },
    checkboxTextMargin: { type: 'string', propGroup: 'checkboxText' },

    checkboxSize: { type: 'number', propGroup: 'checkbox' },
    checkboxRadius: { type: 'number', propGroup: 'checkbox' },
    checkboxBg: { type: 'color', propGroup: 'checkbox' },
    checkboxBorderColor: { type: 'color', propGroup: 'checkbox' },
    checkboxBorderWidth: { type: 'number', propGroup: 'checkbox' },
    checkboxCheckedBg: { type: 'color', propGroup: 'checkbox' },
    checkboxCheckedBorderColor: { type: 'color', propGroup: 'checkbox' },
    checkboxCheckColor: { type: 'color', propGroup: 'checkbox' },
  },
});

export default LeadFormWithCaptcha;
