export const createImage = url =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

export const getRadianAngle = degreeValue => {
  return (degreeValue * Math.PI) / 180;
};

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export const rotateSize = (width, height, rotation) => {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export const genCroppedImg = async (
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    // @ts-expect-error EXPECT
    image.width,
    // @ts-expect-error EXPECT
    image.height,
    rotation,
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  // @ts-expect-error EXPECT
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  // @ts-expect-error EXPECT
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise(resolve => {
    croppedCanvas.toBlob(blob => {
      // @ts-expect-error EXPECT
      const file = new File([blob], 'image.png', {});
      resolve(file);
    });
  });
};

/**
 * convert file to data url
 * DataURLs format: data:[<mediatype>][;base64],<data>
 * reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs
 */
export const convertFileToDataUrl = async file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', e => {
      // @ts-expect-error EXPECT
      resolve(e.target.result);
    });
    reader.addEventListener('error', err => reject(err));

    reader.readAsDataURL(file);
  });
};
