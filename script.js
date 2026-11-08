const copyButton = document.getElementById('copy-btn');
const copyLabel = document.getElementById('copy-label');
const copyStatus = document.getElementById('copy-status');
let copyReset;

function copyWithFallback() {
  const field = document.createElement('textarea');
  field.value = '46354843';
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, field.value.length);
  let copied = false;
  try { copied = document.execCommand('copy'); }
  finally { field.remove(); copyButton.focus({ preventScroll: true }); }
  if (!copied) throw new Error('تعذر النسخ');
}

copyButton.addEventListener('click', async () => {
  clearTimeout(copyReset);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText('46354843'); }
      catch { copyWithFallback(); }
    } else { copyWithFallback(); }
    copyLabel.textContent = 'تم نسخ الرقم';
    copyStatus.textContent = 'تم نسخ رقم الحساب 46354843';
  } catch {
    copyLabel.textContent = 'نسخ رقم الحساب';
    copyStatus.textContent = 'تعذر النسخ. يمكنك نسخ الرقم يدويًا: 46354843';
  }
  copyReset = setTimeout(() => {
    copyLabel.textContent = 'نسخ رقم الحساب';
    copyStatus.textContent = '';
  }, 4000);
});

const photoButtons = [...document.querySelectorAll('[data-photo]')];
const photoDialog = document.querySelector('.photo-dialog');
const expandedPhoto = document.getElementById('expanded-photo');
const photoCount = document.getElementById('photo-count');
const arabicNumbers = new Intl.NumberFormat('ar-u-nu-arab');
let currentPhoto = 0;

function showPhoto(index) {
  currentPhoto = (index + photoButtons.length) % photoButtons.length;
  const original = photoButtons[currentPhoto].querySelector('img');
  expandedPhoto.src = original.src;
  expandedPhoto.alt = original.alt;
  photoCount.textContent = `${arabicNumbers.format(currentPhoto + 1)} / ${arabicNumbers.format(photoButtons.length)}`;
}
photoButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    showPhoto(index);
    if (typeof photoDialog.showModal === 'function') photoDialog.showModal();
    else window.open(expandedPhoto.src, '_blank', 'noopener');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => photoDialog.close());
document.getElementById('photo-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
document.getElementById('photo-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
photoDialog.addEventListener('click', (event) => {
  if (event.target !== photoDialog) return;
  const bounds = photoDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) photoDialog.close();
});
photoDialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(currentPhoto + 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(currentPhoto - 1); }
});
document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach((other) => { if (other !== video) other.pause(); });
  });
});

const sharePosterButton = document.getElementById('share-poster');
const shareLabel = document.getElementById('share-label');
const shareStatus = document.getElementById('share-status');
const posterURL = document.querySelector('.campaign-poster').src;
let posterFile;

// Fetch before the click so the native share sheet keeps its user activation,
// including on iOS. Always share the original JPEG, without recompression.
async function preparePoster() {
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(posterURL, { signal: controller.signal });
    if (!response.ok) throw new Error('تعذر تحميل الملصق');
    const blob = await response.blob();
    if (blob.type !== 'image/jpeg') throw new Error('تعذر قراءة صورة الملصق');
    const file = new File([blob], 'توزيع-الخبز-في-غزة.jpeg', { type: 'image/jpeg' });
    if (navigator.canShare({ files: [file] })) posterFile = file;
  } catch {
    // The download link remains usable if file preparation or sharing is blocked.
  } finally {
    clearTimeout(timeout);
  }
}

preparePoster().finally(() => {
  sharePosterButton.disabled = false;
  shareLabel.textContent = 'مشاركة الملصق';
});

sharePosterButton.addEventListener('click', async () => {
  shareStatus.textContent = '';
  if (!posterFile) {
    shareStatus.textContent = 'مشاركة الصور غير متاحة هنا. اضغط «تنزيل الملصق»، ثم شاركه من الصور مع أصدقائك أو أضفه إلى حالة واتساب.';
    return;
  }
  sharePosterButton.disabled = true;
  try {
    await navigator.share({ files: [posterFile] });
  } catch (error) {
    if (error.name !== 'AbortError') {
      shareStatus.textContent = 'تعذرت المشاركة. يمكنك تنزيل الملصق ومشاركته من الصور أو إضافته إلى حالة واتساب.';
    }
  } finally {
    sharePosterButton.disabled = false;
  }
});
