import * as PIXI from "pixi.js"

import { CubeResource } from "../pixi/cube-resource"
import { MipmapResource } from "./mipmap-resource"

import type { GLTexture, Renderer, BaseTexture } from 'pixi.js';

export type MipmapResourceArray = [
  MipmapResource,
  MipmapResource,
  MipmapResource,
  MipmapResource,
  MipmapResource,
  MipmapResource
]

export class CubemapResource extends CubeResource {
  constructor(source: MipmapResourceArray, public levels = 1) {
    super(source)
  }

  style(renderer: PIXI.Renderer) {
    let gl = renderer.gl
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    if (this.levels > 1) {
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    } else {
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }
    return true
  }

  upload(renderer: Renderer, _baseTexture: BaseTexture, glTexture: GLTexture): boolean
  {
      const dirty = this.itemDirtyIds;

      for (let i = 0; i < CubeResource.SIDES; i++)
      {
          const side = this.items[i];

          if (true || dirty[i] < side.dirtyId)
          {
              if (side.valid && side.resource)
              {
                  side.resource.upload(renderer, side, glTexture);
                  dirty[i] = side.dirtyId;
              }
              else if (dirty[i] < -1)
              {
                  // either item is not valid yet, either its a renderTexture
                  // allocate the memory
                  renderer.gl.texImage2D(
                    <number>side.target,
                    0,
                    glTexture.internalFormat,
                    _baseTexture.realWidth,
                    _baseTexture.realHeight,
                    0,
                    <number>_baseTexture.format,
                    glTexture.type,
                    null
                  );

                  dirty[i] = -1;
              }
          }
      }

      return true;
  }

}