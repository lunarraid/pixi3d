import { CubeMapResource } from "./cubemap-loader"

export class ImageMipMapResource extends PIXI.resources.ImageResource {
  mipmap: PIXI.Texture[] = []

  constructor(source: CubeMapResource, options: any) {
    super(source.source, options)
    if (source.mipmap) {
      for (let i = 0; i < source.mipmap.length; i++) {
        this.mipmap.push(PIXI.Texture.from(source.mipmap[i]))
      }
    }
  }

  upload(renderer: any, baseTexture: PIXI.BaseTexture, glTexture: any, source: any) {
    if (!super.upload(renderer, baseTexture, glTexture, source)) {
      return false
    }
    for (let i = 0; i < this.mipmap.length; i++) {
      let data = this.mipmap[i].baseTexture.resource.source
      renderer.gl.texImage2D(baseTexture.target, i + 1, baseTexture.format,
        baseTexture.format, baseTexture.type, data)
    }
    return true;
  }

  static test(source: any) {
    return typeof source === "object" && typeof source.source === "string" &&
      Array.isArray(source.mipmap)
  }

  static install() {
    if (PIXI.resources.INSTALLED.indexOf(ImageMipMapResource) < 0) {
      PIXI.resources.INSTALLED.push(ImageMipMapResource)
    }
  }
}