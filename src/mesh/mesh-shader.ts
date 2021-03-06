import * as PIXI from "pixi.js"

import { MeshGeometry3D } from "./geometry/mesh-geometry"
import { Mesh3D } from "./mesh"

/**
 * Shader used specifically to render a mesh.
 */
export class MeshShader extends PIXI.Shader {
  private _state = Object.assign(new PIXI.State(), {
    culling: true, clockwiseFrontFace: false, depthTest: true
  })

  /** The name of the mesh shader. Used for figuring out if geometry attributesis compatible with the shader. This needs to be set to something different than default value when custom attributes is used. */
  get name() {
    return "mesh-shader"
  }

  /**
   * Creates geometry with required attributes used by this shader. Override when using custom attributes.
   * @param geometry The geometry with mesh data.
   * @param instanced Value indicating if the geometry will be instanced.
   */
  createShaderGeometry(geometry: MeshGeometry3D, instanced: boolean) {
    let result = new PIXI.Geometry()
    if (geometry.indices) {
      if (geometry.indices.buffer.BYTES_PER_ELEMENT === 1) {
        // PIXI seems to have problems with Uint8Array, let's convert to UNSIGNED_SHORT.
        result.addIndex(new PIXI.Buffer(new Uint16Array(geometry.indices.buffer)))
      } else {
        result.addIndex(new PIXI.Buffer(geometry.indices.buffer))
      }
    }
    if (geometry.positions) {
      result.addAttribute("a_Position", new PIXI.Buffer(geometry.positions.buffer),
        3, false, geometry.positions.componentType, geometry.positions.stride)
    }
    if (geometry.uvs && geometry.uvs[0]) {
      result.addAttribute("a_UV1", new PIXI.Buffer(geometry.uvs[0].buffer),
        2, false, geometry.uvs[0].componentType, geometry.uvs[0].stride)
    }
    if (geometry.normals) {
      result.addAttribute("a_Normal", new PIXI.Buffer(geometry.normals.buffer),
        3, false, geometry.normals.componentType, geometry.normals.stride)
    }
    if (geometry.tangents) {
      result.addAttribute("a_Tangent", new PIXI.Buffer(geometry.tangents.buffer),
        4, false, geometry.tangents.componentType, geometry.tangents.stride)
    }
    return result
  }

  /**
   * Renders the geometry of the specified mesh.
   * @param mesh Mesh to render.
   * @param renderer Renderer to use.
   * @param state Rendering state to use.
   * @param drawMode Draw mode to use.
   */
  render(mesh: Mesh3D, renderer: PIXI.Renderer, state: PIXI.State = this._state, drawMode = PIXI.DRAW_MODES.TRIANGLES) {
    const instanceCount = mesh.instances.filter(i =>
      i.worldVisible && i.renderable).length
    const instancing = mesh.instances.length > 0
    if (!mesh.geometry.hasShaderGeometry(this, instancing)) {
      mesh.geometry.addShaderGeometry(this, instancing)
    }
    let geometry = mesh.geometry.getShaderGeometry(this)
    renderer.shader.bind(this, false)
    renderer.state.set(state)
    renderer.geometry.bind(geometry, this)
    renderer.geometry.draw(drawMode, undefined, undefined, instanceCount)
  }
}