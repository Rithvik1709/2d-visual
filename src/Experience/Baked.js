import * as THREE from 'three'

import Experience from './Experience.js'
import vertexShader from './shaders/baked/vertex.glsl'
import fragmentShader from './shaders/baked/fragment.glsl'

export default class CoffeeSteam
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'baked',
                expanded: true
            })
        }

        this.setModel()
    }

    setModel()
    {
        this.model = {}
        
        this.model.mesh = this.resources.items.roomModel.scene.children[0]
        this.removeDeskProps(this.model.mesh)

        this.model.bakedDayTexture = this.resources.items.bakedDayTexture
        this.model.bakedDayTexture.encoding = THREE.sRGBEncoding
        this.model.bakedDayTexture.flipY = false

        this.model.bakedNightTexture = this.resources.items.bakedNightTexture
        this.model.bakedNightTexture.encoding = THREE.sRGBEncoding
        this.model.bakedNightTexture.flipY = false

        this.model.bakedNeutralTexture = this.resources.items.bakedNeutralTexture
        this.model.bakedNeutralTexture.encoding = THREE.sRGBEncoding
        this.model.bakedNeutralTexture.flipY = false

        this.model.lightMapTexture = this.resources.items.lightMapTexture
        this.model.lightMapTexture.flipY = false

        this.colors = {}
        this.colors.tv = '#ff115e'
        this.colors.desk = '#ff6700'
        this.colors.pc = '#0082ff'

        this.model.material = new THREE.ShaderMaterial({
            uniforms:
            {
                uBakedDayTexture: { value: this.model.bakedDayTexture },
                uBakedNightTexture: { value: this.model.bakedNightTexture },
                uBakedNeutralTexture: { value: this.model.bakedNeutralTexture },
                uLightMapTexture: { value: this.model.lightMapTexture },

                uNightMix: { value: 1 },
                uNeutralMix: { value: 0 },

                uLightTvColor: { value: new THREE.Color(this.colors.tv) },
                uLightTvStrength: { value: 1.47 },

                uLightDeskColor: { value: new THREE.Color(this.colors.desk) },
                uLightDeskStrength: { value: 1.9 },

                uLightPcColor: { value: new THREE.Color(this.colors.pc) },
                uLightPcStrength: { value: 1.4 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })

        this.model.mesh.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                _child.material = this.model.material
            }
        })

        this.scene.add(this.model.mesh)
        
        // Debug
        if(this.debug)
        {
            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uNightMix,
                    'value',
                    { label: 'uNightMix', min: 0, max: 1 }
                )

            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uNeutralMix,
                    'value',
                    { label: 'uNeutralMix', min: 0, max: 1 }
                )

            this.debugFolder
                .addInput(
                    this.colors,
                    'tv',
                    { view: 'color' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightTvColor.value.set(this.colors.tv)
                })

            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uLightTvStrength,
                    'value',
                    { label: 'uLightTvStrength', min: 0, max: 3 }
                )

            this.debugFolder
                .addInput(
                    this.colors,
                    'desk',
                    { view: 'color' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightDeskColor.value.set(this.colors.desk)
                })

            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uLightDeskStrength,
                    'value',
                    { label: 'uLightDeskStrength', min: 0, max: 3 }
                )

            this.debugFolder
                .addInput(
                    this.colors,
                    'pc',
                    { view: 'color' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightPcColor.value.set(this.colors.pc)
                })

            this.debugFolder
                .addInput(
                    this.model.material.uniforms.uLightPcStrength,
                    'value',
                    { label: 'uLightPcStrength', min: 0, max: 3 }
                )
        }
    }

    removeDeskProps(_mesh)
    {
        const removalBoxes = [
            { min: new THREE.Vector3(3.75, 0.45, - 2.45), max: new THREE.Vector3(4.32, 1.05, - 1.85) },
            { min: new THREE.Vector3(4.30, 0.55, - 3.30), max: new THREE.Vector3(4.55, 1.20, - 3.05) },
            { min: new THREE.Vector3(3.65, 2.95, - 3.42), max: new THREE.Vector3(4.35, 3.55, - 3.00) },
            { min: new THREE.Vector3(1.40, 0.75, - 4.30), max: new THREE.Vector3(3.95, 2.90, - 2.45) }
        ]

        _mesh.traverse((_child) =>
        {
            if(!(_child instanceof THREE.Mesh) || !_child.geometry.index)
                return

            const geometry = _child.geometry
            const position = geometry.attributes.position
            const index = geometry.index
            const nextIndex = []
            const pointA = new THREE.Vector3()
            const pointB = new THREE.Vector3()
            const pointC = new THREE.Vector3()
            const center = new THREE.Vector3()

            for(let i = 0; i < index.count; i += 3)
            {
                const a = index.getX(i)
                const b = index.getX(i + 1)
                const c = index.getX(i + 2)

                center
                    .copy(pointA.fromBufferAttribute(position, a))
                    .add(pointB.fromBufferAttribute(position, b))
                    .add(pointC.fromBufferAttribute(position, c))
                    .multiplyScalar(1 / 3)

                const shouldRemove = removalBoxes.some((_box) =>
                    center.x >= _box.min.x &&
                    center.x <= _box.max.x &&
                    center.y >= _box.min.y &&
                    center.y <= _box.max.y &&
                    center.z >= _box.min.z &&
                    center.z <= _box.max.z
                )

                if(!shouldRemove)
                    nextIndex.push(a, b, c)
            }

            geometry.setIndex(nextIndex)
            geometry.computeBoundingSphere()
        })
    }
}
