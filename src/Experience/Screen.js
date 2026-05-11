import * as THREE from 'three'

import Experience from './Experience.js'

export default class Screen
{
    constructor(_mesh, _sourcePath)
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.world = this.experience.world

        this.mesh = _mesh
        this.sourcePath = _sourcePath

        this.setModel()
    }

    isImageSource(_sourcePath)
    {
        return /\.(png|jpe?g|webp|gif|avif)$/i.test(_sourcePath)
    }

    isBlackSource(_sourcePath)
    {
        return _sourcePath === 'black'
    }

    setModel()
    {
        this.model = {}

        // Material
        if(this.isBlackSource(this.sourcePath))
        {
            this.model.material = new THREE.MeshBasicMaterial({
                color: 0x000000
            })
        }
        else if(this.isImageSource(this.sourcePath))
        {
            this.model.texture = new THREE.TextureLoader().load(this.sourcePath)
            this.model.texture.flipY = false

            this.model.material = new THREE.MeshBasicMaterial({
                map: this.model.texture
            })
        }
        else
        {
            // Element
            this.model.element = document.createElement('video')
            this.model.element.muted = true
            this.model.element.loop = true
            this.model.element.controls = true
            this.model.element.playsInline = true
            this.model.element.autoplay = true
            this.model.element.src = this.sourcePath
            this.model.element.play()

            this.model.texture = new THREE.VideoTexture(this.model.element)

            this.model.texture.encoding = THREE.sRGBEncoding

            this.model.material = new THREE.MeshBasicMaterial({
                map: this.model.texture
            })
        }

        // Mesh
        this.model.mesh = this.mesh
        this.model.mesh.material = this.model.material
        this.scene.add(this.model.mesh)
    }

    update()
    {
        // this.model.group.rotation.y = Math.sin(this.time.elapsed * 0.0005) * 0.5
    }
}