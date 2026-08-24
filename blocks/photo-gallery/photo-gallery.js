import { createOptimizedPicture } from '../../scripts/aem.js';

function goToImage(overlay, images, index) {
  const total = images.length;
  const nextIndex = ((index % total) + total) % total;
  const mainImg = overlay.querySelector('.photo-gallery-image-container img');
  mainImg.src = images[nextIndex].src;
  mainImg.alt = images[nextIndex].alt;
  overlay.querySelector('.photo-gallery-image-counter').textContent = `${nextIndex + 1}/${total}`;
  overlay.querySelector('.photo-gallery-modal-title').textContent = images[nextIndex].caption;
  overlay.querySelectorAll('.photo-gallery-thumbnail').forEach((thumb, i) => {
    const active = i === nextIndex;
    thumb.classList.toggle('active', active);
    if (active) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
  return nextIndex;
}

function createModal(images, startIndex) {
  let index = startIndex;
  let slideshowTimer = null;

  const overlay = document.createElement('div');
  overlay.className = 'photo-gallery-modal-overlay';

  const content = document.createElement('div');
  content.className = 'photo-gallery-modal-content';
  overlay.append(content);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'photo-gallery-close-button';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '×';
  content.append(closeButton);

  const main = document.createElement('div');
  main.className = 'photo-gallery-modal-main';
  content.append(main);

  const imageContainer = document.createElement('div');
  imageContainer.className = 'photo-gallery-image-container';
  main.append(imageContainer);

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'photo-gallery-nav-button prev';
  prevButton.setAttribute('aria-label', 'Previous image');
  imageContainer.append(prevButton);

  const mainImg = document.createElement('img');
  mainImg.src = images[index].src;
  mainImg.alt = images[index].alt;
  imageContainer.append(mainImg);

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'photo-gallery-nav-button next';
  nextButton.setAttribute('aria-label', 'Next image');
  imageContainer.append(nextButton);

  const thumbsContainer = document.createElement('div');
  thumbsContainer.className = 'photo-gallery-thumbnails-container';
  main.append(thumbsContainer);

  const thumbsWrapper = document.createElement('div');
  thumbsWrapper.className = 'photo-gallery-thumbnails-wrapper';
  thumbsContainer.append(thumbsWrapper);

  images.forEach((image, i) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = `photo-gallery-thumbnail${i === index ? ' active' : ''}`;
    thumb.setAttribute('aria-label', image.caption || `Image ${i + 1}`);
    const thumbImg = document.createElement('img');
    thumbImg.src = image.src;
    thumbImg.alt = '';
    thumb.append(thumbImg);
    thumb.addEventListener('click', () => {
      // eslint-disable-next-line no-use-before-define
      stopSlideshow();
      index = goToImage(overlay, images, i);
    });
    thumbsWrapper.append(thumb);
  });

  const controls = document.createElement('div');
  controls.className = 'photo-gallery-modal-controls';
  main.append(controls);

  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.className = 'photo-gallery-play-button';
  playButton.setAttribute('aria-label', 'Play slideshow');
  playButton.textContent = '▶';
  controls.append(playButton);

  const counter = document.createElement('p');
  counter.className = 'photo-gallery-image-counter';
  counter.textContent = `${index + 1}/${images.length}`;
  controls.append(counter);

  const title = document.createElement('p');
  title.className = 'photo-gallery-modal-title';
  title.textContent = images[index].caption;
  controls.append(title);

  function stopSlideshow() {
    playButton.classList.remove('playing');
    playButton.textContent = '▶';
    clearInterval(slideshowTimer);
    slideshowTimer = null;
  }

  function onKeydown(e) {
    if (e.key === 'ArrowLeft') prevButton.click();
    else if (e.key === 'ArrowRight') nextButton.click();
    else if (e.key === 'Escape') closeButton.click();
  }

  function closeModal() {
    stopSlideshow();
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
  }

  prevButton.addEventListener('click', () => {
    stopSlideshow();
    index = goToImage(overlay, images, index - 1);
  });

  nextButton.addEventListener('click', () => {
    stopSlideshow();
    index = goToImage(overlay, images, index + 1);
  });

  playButton.addEventListener('click', () => {
    if (slideshowTimer) {
      stopSlideshow();
    } else {
      playButton.classList.add('playing');
      playButton.textContent = '❚❚';
      slideshowTimer = setInterval(() => {
        index = goToImage(overlay, images, index + 1);
      }, 3000);
    }
  });

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', onKeydown);

  document.body.append(overlay);
  closeButton.focus();
}

/**
 * loads and decorates the photo gallery block
 * @param {Element} block The photo-gallery block element
 */
export default function decorate(block) {
  const images = [...block.children].map((row) => {
    const [imageCell, captionCell] = row.children;
    const img = imageCell.querySelector('img');
    const caption = captionCell?.textContent.trim() || '';
    return {
      src: img.src,
      alt: img.alt || caption,
      caption,
    };
  });

  const grid = document.createElement('div');
  grid.className = 'photo-grid';

  images.forEach((image, index) => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    item.append(createOptimizedPicture(image.src, image.alt, false, [{ width: '400' }]));
    const hoverIcon = document.createElement('span');
    hoverIcon.className = 'hover-icon';
    item.append(hoverIcon);
    item.addEventListener('click', () => createModal(images, index));
    grid.append(item);
  });

  block.replaceChildren(grid);
}
