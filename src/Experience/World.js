import * as THREE from 'three'
import Experience from './Experience.js'
import Baked from './Baked.js'
import GoogleLeds from './GoogleLeds.js'
import LoupedeckButtons from './LoupedeckButtons.js'
import CoffeeSteam from './CoffeeSteam.js'
import TopChair from './TopChair.js'
import BouncingLogo from './BouncingLogo.js'
import Screen from './Screen.js'

export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera
        this.targetElement = this.experience.targetElement

        this.browserOverlay = document.getElementById('browserOverlay')
        this.browserUrl = document.getElementById('browserUrl')
        this.browserGo = document.getElementById('browserGo')
        this.browserClose = document.getElementById('browserClose')
        this.browserFrame = document.getElementById('browserFrame')

        this.raycaster = new THREE.Raycaster()
        this.pointer = new THREE.Vector2()
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setBaked()
                this.setGoogleLeds()
                this.setLoupedeckButtons()
                this.setCoffeeSteam()
                this.setTopChair()
                this.setBouncingLogo()
                this.setScreens()
            }
        })
    }

    setBaked()
    {
        this.baked = new Baked()
    }

    setGoogleLeds()
    {
        this.googleLeds = new GoogleLeds()
    }

    setLoupedeckButtons()
    {
        this.loupedeckButtons = new LoupedeckButtons()
    }

    setCoffeeSteam()
    {
        this.coffeeSteam = new CoffeeSteam()
    }

    setTopChair()
    {
        this.topChair = new TopChair()
    }

    setBouncingLogo()
    {
        this.bouncingLogo = new BouncingLogo()
    }

    setScreens()
    {
        this.pcScreen = new Screen(
            this.resources.items.pcScreenModel.scene.children[0],
            '/assets/videoPortfolio.mp4'
        )
        this.macScreen = new Screen(
            this.resources.items.macScreenModel.scene.children[0],
            'black'
        )

        this.setLaptopBrowserInteraction()
    }

    setLaptopBrowserInteraction()
    {
        this.openBrowserOverlay = (_url) =>
        {
            if(!this.browserOverlay)
                return

            this.browserOverlay.classList.add('is-open')
            this.browserOverlay.setAttribute('aria-hidden', 'false')
            this.targetElement.style.pointerEvents = 'none'
            this.loadBrowserUrl(_url)
        }

        this.closeBrowserOverlay = () =>
        {
            if(!this.browserOverlay)
                return

            this.browserOverlay.classList.remove('is-open')
            this.browserOverlay.setAttribute('aria-hidden', 'true')
            this.targetElement.style.pointerEvents = 'auto'
        }

        this.normalizeBrowserUrl = (_url) =>
        {
            const value = _url.trim()
            if(!value)
                return '/browser-home.html'

            if(/^https?:\/\//i.test(value))
                return value

            return `https://${value}`
        }

        this.loadBrowserUrl = (_url) =>
        {
            if(!this.browserFrame || !this.browserUrl)
                return

            const nextUrl = this.normalizeBrowserUrl(_url)
            this.browserUrl.value = nextUrl
            this.browserFrame.src = nextUrl
        }

        this.onBrowserSubmit = (_event) =>
        {
            _event.preventDefault()
            this.loadBrowserUrl(this.browserUrl.value)
        }

        this.onBrowserEscape = (_event) =>
        {
            if(_event.key === 'Escape' && this.browserOverlay.classList.contains('is-open'))
            {
                this.closeBrowserOverlay()
            }
        }

        if(this.browserGo)
            this.browserGo.addEventListener('click', this.onBrowserSubmit)

        if(this.browserClose)
            this.browserClose.addEventListener('click', this.closeBrowserOverlay)

        if(this.browserUrl)
            this.browserUrl.addEventListener('keydown', (_event) =>
            {
                if(_event.key === 'Enter')
                    this.onBrowserSubmit(_event)
            })

        if(this.browserOverlay)
        {
            this.browserOverlay.addEventListener('click', (_event) =>
            {
                if(_event.target === this.browserOverlay)
                    this.closeBrowserOverlay()
            })
        }

        window.addEventListener('keydown', this.onBrowserEscape)

        this.onLaptopClick = (_event) =>
        {
            const bounds = this.targetElement.getBoundingClientRect()

            this.pointer.x = ((_event.clientX - bounds.left) / bounds.width) * 2 - 1
            this.pointer.y = - ((_event.clientY - bounds.top) / bounds.height) * 2 + 1

            this.raycaster.setFromCamera(this.pointer, this.camera.instance)

            // Cast rays to all objects in scene to detect any click in the 3D view
            const allIntersects = this.raycaster.intersectObjects(this.scene.children, true)
            
            if(allIntersects.length > 0)
            {
                this.openBrowserOverlay(this.browserUrl ? this.browserUrl.value : '/browser-home.html')
            }
        }

        this.targetElement.addEventListener('click', this.onLaptopClick)
    }

    resize()
    {
    }

    update()
    {
        if(this.googleLeds)
            this.googleLeds.update()

        if(this.loupedeckButtons)
            this.loupedeckButtons.update()

        if(this.coffeeSteam)
            this.coffeeSteam.update()

        if(this.topChair)
            this.topChair.update()

        if(this.bouncingLogo)
            this.bouncingLogo.update()
    }

    destroy()
    {
        if(this.onLaptopClick)
        {
            this.targetElement.removeEventListener('click', this.onLaptopClick)
        }

        if(this.browserGo && this.onBrowserSubmit)
            this.browserGo.removeEventListener('click', this.onBrowserSubmit)

        if(this.browserClose && this.closeBrowserOverlay)
            this.browserClose.removeEventListener('click', this.closeBrowserOverlay)

        if(this.onBrowserEscape)
            window.removeEventListener('keydown', this.onBrowserEscape)
    }
}
