let app = new PIXI.Application({
  backgroundColor: 0xdddddd, resizeTo: window, antialias: true
})
document.body.appendChild(app.view)

let control = new PIXI3D.CameraOrbitControl(app.view)

app.loader.add("diffuse.cubemap", "assets/environments/autumn/diffuse.cubemap")
app.loader.add("specular.cubemap", "assets/environments/autumn/specular.cubemap")
app.loader.add("skybox.cubemap", "assets/environments/autumn/skybox.cubemap")
app.loader.add("waterbottle.gltf", "assets/models/waterbottle/waterbottle.gltf")

app.loader.load((loader, resources) => {
  let skybox = app.stage.addChild(
    new PIXI3D.Skybox(resources["skybox.cubemap"].cubemap))

  let model = app.stage.addChild(
    PIXI3D.Model.from(resources["waterbottle.gltf"].gltf))
  model.scale.set(15)
  model.rotationQuaternion.setEulerAngles(0, -30, 20)

  let imageBasedLighting = new PIXI3D.ImageBasedLighting(
    resources["diffuse.cubemap"].cubemap,
    resources["specular.cubemap"].cubemap)

  PIXI3D.LightingEnvironment.main =
    new PIXI3D.LightingEnvironment(app.renderer, imageBasedLighting)
})