import * as PIXI from "pixi.js"

import { Color } from "../color"
import { RenderPass } from "./render-pass"
import { Mesh3D } from "../mesh/mesh"

/**
 * Pass used for rendering materials.
 */
export class MaterialRenderPass implements RenderPass {
  private _renderTexture?: PIXI.RenderTexture

  /** The color (r,g,b,a) used for clearing the render texture. If this value is empty, the render texture will not be cleared. */
  clearColor?= new Color(0, 0, 0, 0)

  /** The texture used when rendering to a texture. */
  get renderTexture() {
    return this._renderTexture
  }

  set renderTexture(value: PIXI.RenderTexture | undefined) {
    this._renderTexture = value
  }

  /**
   * Creates a new material render pass.
   * @param renderer The renderer to use.
   * @param name The name of the render pass.
   */
  constructor(public renderer: PIXI.Renderer, public name: string) {
  }

  clear() {
    if (this._renderTexture && this.clearColor) {
      this.renderer.renderTexture.bind(this._renderTexture)
      this.renderer.renderTexture.clear(Array.from(this.clearColor.rgba))
      this.renderer.renderTexture.bind(undefined)
    }
  }

  render(meshes: Mesh3D[]) {
    const currentRenderTexture = this.renderer.renderTexture.current

    if (this._renderTexture) {
      this.renderer.renderTexture.bind(this._renderTexture)
    }

    for (let mesh of meshes) {
      if (mesh.material) {
        mesh.material.render(mesh, this.renderer)
      }
    }

    if (this._renderTexture) {
      this.renderer.renderTexture.bind(currentRenderTexture)
    }
  }
}