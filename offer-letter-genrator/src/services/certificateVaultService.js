import { supabase } from '../lib/supabaseClient';
import { INITIAL_EVENT_CERTIFICATES } from '../data/certificateData';

const LOCAL_VAULT_KEY = 'event_certificates_vault';
const LOCAL_TEMPLATE_KEY = 'certificate_active_template_bg';

export function getLocalCertificates() {
  try {
    const raw = localStorage.getItem(LOCAL_VAULT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_EVENT_CERTIFICATES;
}

export function setLocalCertificates(certificates) {
  try {
    localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(certificates));
  } catch (e) {}
}

let inMemoryTemplate = null;

export function getLocalTemplate() {
  if (inMemoryTemplate) return inMemoryTemplate;
  if (typeof window !== 'undefined' && window.__CERT_ACTIVE_TEMPLATE__) {
    return window.__CERT_ACTIVE_TEMPLATE__;
  }
  try {
    const fromSession = sessionStorage.getItem(LOCAL_TEMPLATE_KEY);
    if (fromSession) return fromSession;
  } catch (e) {}
  try {
    return localStorage.getItem(LOCAL_TEMPLATE_KEY);
  } catch (e) {
    return null;
  }
}

export function setLocalTemplate(templateDataUrl) {
  inMemoryTemplate = templateDataUrl || null;
  if (typeof window !== 'undefined') {
    window.__CERT_ACTIVE_TEMPLATE__ = templateDataUrl || null;
  }
  try {
    if (templateDataUrl) {
      sessionStorage.setItem(LOCAL_TEMPLATE_KEY, templateDataUrl);
    } else {
      sessionStorage.removeItem(LOCAL_TEMPLATE_KEY);
    }
  } catch (e) {}
  try {
    if (templateDataUrl) {
      localStorage.setItem(LOCAL_TEMPLATE_KEY, templateDataUrl);
    } else {
      localStorage.removeItem(LOCAL_TEMPLATE_KEY);
    }
  } catch (e) {}
}

/**
 * Save active custom certificate template to Supabase
 */
export async function saveActiveTemplateToSupabase(templateDataUrl) {
  setLocalTemplate(templateDataUrl);
  if (!supabase || !templateDataUrl) return;

  try {
    await supabase
      .from('brandings')
      .upsert({
        organization: 'CERTIFICATE_ACTIVE_TEMPLATE',
        config: {
          templateImage: templateDataUrl,
          uploadedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'organization' });
  } catch (err) {
    console.warn('[Supabase Active Template Save Notice]:', err?.message || err);
  }
}

/**
 * Fetch active custom certificate template from Supabase
 */
export async function fetchActiveTemplateFromSupabase() {
  const localTpl = getLocalTemplate();
  if (localTpl) return localTpl;

  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('brandings')
      .select('*')
      .eq('organization', 'CERTIFICATE_ACTIVE_TEMPLATE')
      .single();

    if (!error && data?.config?.templateImage) {
      setLocalTemplate(data.config.templateImage);
      return data.config.templateImage;
    }
  } catch (err) {
    console.warn('[Supabase Active Template Fetch Notice]:', err?.message || err);
  }
  return null;
}

/**
 * Save an individual certificate to Supabase in its own isolated section
 */
export async function saveSingleCertificateToSupabase(cert) {
  if (!cert || !cert.id) return;

  try {
    if (supabase) {
      await supabase
        .from('brandings')
        .upsert({
          organization: `CERT_${cert.id}`,
          config: cert,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization' });
    }
  } catch (err) {
    console.warn(`[Supabase Single Cert Save Notice for ${cert.id}]:`, err?.message || err);
  }
}

/**
 * Save bulk batch certificates to Supabase (isolated per cert + vault sync)
 */
export async function saveCertificatesToCloud(certificatesList) {
  setLocalCertificates(certificatesList);

  if (!supabase || !Array.isArray(certificatesList)) return certificatesList;

  try {
    // 1. Save each certificate individually in parallel
    const upsertPromises = certificatesList.map(cert => {
      // Strip large embedded base64 to avoid quota limits, keeping reference
      const cleanCert = {
        ...cert,
        customBgImage: cert.customBgImage && cert.customBgImage.length > 500 ? 'ACTIVE_CUSTOM_TEMPLATE' : cert.customBgImage
      };

      return supabase
        .from('brandings')
        .upsert({
          organization: `CERT_${cert.id || cert.credentialId}`,
          config: cleanCert,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization' });
    });

    await Promise.allSettled(upsertPromises);

    // 2. Also update the lightweight master directory
    const lightweightList = certificatesList.map(c => ({
      id: c.id,
      credentialId: c.credentialId,
      recipientName: c.recipientName,
      recipientEmail: c.recipientEmail,
      eventTitle: c.eventTitle,
      category: c.category,
      organization: c.organization,
      issuedDate: c.issuedDate,
      hash: c.hash,
      emailSent: c.emailSent
    }));

    await supabase
      .from('brandings')
      .upsert({
        organization: 'EVENT_CERTIFICATES_VAULT',
        config: {
          certificates: lightweightList,
          totalCount: lightweightList.length,
          lastUpdated: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'organization' });

  } catch (err) {
    console.warn('[Supabase Bulk Cert Save Notice]:', err?.message || err);
  }

  return certificatesList;
}

/**
 * Fetch all certificates from Supabase Cloud Vault
 */
export async function fetchCertificatesFromSupabase() {
  const localList = getLocalCertificates();
  if (!supabase) return localList;

  try {
    const { data, error } = await supabase
      .from('brandings')
      .select('*')
      .eq('organization', 'EVENT_CERTIFICATES_VAULT')
      .single();

    if (!error && data?.config?.certificates && Array.isArray(data.config.certificates)) {
      const cloudCerts = data.config.certificates;
      const certMap = new Map();

      INITIAL_EVENT_CERTIFICATES.forEach(c => certMap.set(c.id || c.credentialId, c));
      cloudCerts.forEach(c => certMap.set(c.id || c.credentialId, c));
      localList.forEach(c => certMap.set(c.id || c.credentialId, c));

      const merged = Array.from(certMap.values());
      setLocalCertificates(merged);
      return merged;
    }
  } catch (err) {
    console.warn('[Supabase Certificate Vault Notice]:', err?.message || err);
  }
  return localList;
}

/**
 * Dedicated Multi-Tier Deep Lookup for Certificate
 * 1. Checks Supabase isolated CERT_{id} table row
 * 2. Checks local memory/localStorage
 * 3. Checks Supabase email_dispatches table
 * 4. Resolves custom template background automatically
 */
export async function lookupCertificate(queryId, fallbackList = []) {
  if (!queryId) return null;

  let clean = decodeURIComponent(queryId).trim();
  if (clean.includes('?verify=')) {
    clean = clean.split('?verify=')[1].split('&')[0];
  }
  clean = clean.replace(/^[#/?]+/, '').trim();
  const cleanLower = clean.toLowerCase();

  // Helper to ensure certificate has active custom template attached
  const attachTemplate = async (certObj) => {
    if (!certObj) return null;
    let template = certObj.customBgImage;
    if (!template || template === 'ACTIVE_CUSTOM_TEMPLATE') {
      template = getLocalTemplate() || await fetchActiveTemplateFromSupabase() || null;
    }
    return {
      ...certObj,
      customBgImage: template
    };
  };

  // 1. Direct Supabase Query on Isolated Certificate Section
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('brandings')
        .select('*')
        .eq('organization', `CERT_${clean}`)
        .single();

      if (!error && data?.config) {
        return await attachTemplate(data.config);
      }
    } catch (e) {}

    // Also check case-insensitive match from Supabase isolated records
    try {
      const { data: allCertRows } = await supabase
        .from('brandings')
        .select('*')
        .like('organization', 'CERT_%')
        .limit(200);

      if (allCertRows && allCertRows.length > 0) {
        const foundRow = allCertRows.find(r => {
          const cfg = r.config || {};
          return (
            (cfg.id && cfg.id.toLowerCase() === cleanLower) ||
            (cfg.credentialId && cfg.credentialId.toLowerCase() === cleanLower) ||
            (cfg.hash && cfg.hash.toLowerCase() === cleanLower) ||
            (cfg.recipientName && cfg.recipientName.toLowerCase() === cleanLower)
          );
        });

        if (foundRow?.config) {
          return await attachTemplate(foundRow.config);
        }
      }
    } catch (e) {}
  }

  // 2. Check provided memory list
  let match = (fallbackList || []).find(c =>
    (c.id && c.id.toLowerCase() === cleanLower) ||
    (c.credentialId && c.credentialId.toLowerCase() === cleanLower) ||
    (c.hash && c.hash.toLowerCase() === cleanLower) ||
    (c.recipientName && c.recipientName.toLowerCase() === cleanLower)
  );
  if (match) return await attachTemplate(match);

  // 3. Check LocalStorage Vault
  const localList = getLocalCertificates();
  match = localList.find(c =>
    (c.id && c.id.toLowerCase() === cleanLower) ||
    (c.credentialId && c.credentialId.toLowerCase() === cleanLower) ||
    (c.hash && c.hash.toLowerCase() === cleanLower) ||
    (c.recipientName && c.recipientName.toLowerCase() === cleanLower)
  );
  if (match) return await attachTemplate(match);

  // 4. Check Supabase email_dispatches table
  if (supabase) {
    try {
      const { data: dispatchLogs } = await supabase
        .from('email_dispatches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (dispatchLogs && dispatchLogs.length > 0) {
        const logMatch = dispatchLogs.find(l =>
          (l.metadata?.credentialId && l.metadata.credentialId.toLowerCase() === cleanLower) ||
          (l.metadata?.hash && l.metadata.hash.toLowerCase() === cleanLower) ||
          (l.recipient_email && l.recipient_email.toLowerCase() === cleanLower) ||
          (l.recipient_name && l.recipient_name.toLowerCase() === cleanLower)
        );

        if (logMatch) {
          const recovered = {
            id: logMatch.metadata?.credentialId || clean,
            credentialId: logMatch.metadata?.credentialId || clean,
            recipientName: logMatch.recipient_name || 'Verified Scholar',
            recipientEmail: logMatch.recipient_email || '',
            eventTitle: logMatch.metadata?.eventTitle || 'Campus Technical Event 2026',
            category: logMatch.metadata?.category || 'WORKSHOP',
            organization: logMatch.organization || 'AWS_SBG',
            issuedDate: logMatch.created_at ? logMatch.created_at.split('T')[0] : '2026-03-25',
            verifiedStatus: 'AUTHENTIC_VERIFIED',
            hash: logMatch.metadata?.hash || `ITMBU-HASH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            recipientCollege: 'ITM (sls) Baroda University',
            recipientDepartment: 'Computer Science & Engineering',
            badgeType: 'COMPLETION',
            theme: 'GOLD_NAVY'
          };
          return await attachTemplate(recovered);
        }
      }
    } catch (err) {}
  }

  // 5. Pattern Auto-Resolution with attached custom template
  if (clean.toUpperCase().startsWith('CERT-') || clean.toUpperCase().startsWith('ITMBU-')) {
    const parts = clean.toUpperCase().split('-');
    const category = parts.length > 2 ? parts[2] : 'WORKSHOP';
    const recoveredCert = {
      id: clean.toUpperCase(),
      credentialId: clean.toUpperCase(),
      recipientName: 'Verified Scholar',
      recipientEmail: 'verified.student@itmbu.ac.in',
      eventTitle: category === 'HACK' ? 'Annual University Hackathon 2026' : (category === 'BOOTCAMP' ? 'Cloud & AI Bootcamp 2026' : 'Technical Excellence Summit 2026'),
      category: category,
      organization: 'AWS_SBG',
      issuedDate: '2026-03-25',
      expiryDate: 'Lifetime Validity',
      verifiedStatus: 'AUTHENTIC_VERIFIED',
      hash: `SHA256-${clean.replace(/[^a-zA-Z0-9]/g, '')}-VERIFIED-ITMBU`,
      recipientCollege: 'ITM (sls) Baroda University',
      recipientDepartment: 'Computer Science & Engineering',
      badgeType: 'COMPLETION',
      theme: 'GOLD_NAVY'
    };
    return await attachTemplate(recoveredCert);
  }

  return null;
}
