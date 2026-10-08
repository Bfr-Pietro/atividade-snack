import { Image } from "react-native";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

export const MAX_IMAGE_BYTES = 600 * 1024;

const MAX_SIDE = 1600;
const QUALITIES = [0.8, 0.65, 0.5, 0.4, 0.3];
const SHRINK = 0.75;
const MIN_WIDTH = 48;
const PREFIX = "data:image/jpeg;base64,";

export const formatBytes = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${Math.round(bytes / 1024)} KB`;

const manipulatorEngine = {
  async render(uri, width) {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width });
    const ref = await context.renderAsync();
    return {
      async save(quality) {
        const result = await ref.saveAsync({
          format: SaveFormat.JPEG,
          compress: quality,
          base64: true,
        });
        return { base64: result.base64, width: result.width, height: result.height };
      },
      release() {
        try {
          ref.release?.();
          context.release?.();
        } catch (e) {}
      },
    };
  },
};

const getImageSize = (uri) =>
  new Promise((resolve, reject) => Image.getSize(uri, (w, h) => resolve({ w, h }), reject));

export async function compressImageToBase64(
  uri,
  { width: srcWidth, height: srcHeight, maxBytes = MAX_IMAGE_BYTES, engine = manipulatorEngine } = {},
) {
  if (!srcWidth || !srcHeight) {
    try {
      const size = await getImageSize(uri);
      srcWidth = size.w;
      srcHeight = size.h;
    } catch (e) {
      srcWidth = MAX_SIDE;
      srcHeight = MAX_SIDE;
    }
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(srcWidth, srcHeight));
  let width = Math.max(MIN_WIDTH, Math.round(srcWidth * scale));
  let attempts = 0;

  while (true) {
    const rendered = await engine.render(uri, width);
    try {
      for (const quality of QUALITIES) {
        attempts += 1;
        const out = await rendered.save(quality);
        const dataUri = PREFIX + out.base64;
        if (dataUri.length <= maxBytes) {
          return {
            dataUri,
            bytes: dataUri.length,
            width: out.width,
            height: out.height,
            quality,
            attempts,
          };
        }
      }
    } finally {
      rendered.release();
    }
    if (width <= MIN_WIDTH) break;
    width = Math.max(MIN_WIDTH, Math.floor(width * SHRINK));
  }

  throw new Error("Não foi possível comprimir a imagem até o limite de tamanho.");
}
