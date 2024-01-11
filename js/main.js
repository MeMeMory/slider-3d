const customSlider = (name, opts) => {
	const slider = document.querySelector(`.${name}`)
	const sliderWrapper = slider.querySelector('.slider-wrapper')
	const slides = Array.from(sliderWrapper.children)
	const duration = opts.duration

	const arrowLeft = slider.querySelector('.arrow_left')
	const arrowRight = slider.querySelector('.arrow_right')

	let slideIndex = 2
	let isMoving = false

	let slidesInView = opts.slidesInView

	const cloneSlides = () => {
		let cloneCount = Math.ceil((slides.length - slidesInView) / 2) + 2

		for (let i = 0; i <= cloneCount - 1; i++) {
			const clone = slides[i].cloneNode(true)
			sliderWrapper.appendChild(clone)
		}

		for (let i = cloneCount; i >= 1; i--) {
			const clone = slides[slides.length - i].cloneNode(true)
			sliderWrapper.insertBefore(clone, slides[0])
		}
	}

	const setSlidesBase = () => {
		const rect = sliderWrapper.getBoundingClientRect()
		const sliderWidth = rect.width
		const slides = Array.from(sliderWrapper.children)

		slides.map((slide) => {
			slide.style.width = `${sliderWidth / slidesInView}px`
			slide.style.transition = `transform ${duration}ms ease-in-out`
		})
	}

	const applyTransform = (slide, opts) => {
		slide.style.transform = `
        translate3d(0rem, 0rem, -${opts.translateZ}rem)
        rotateY(${opts.rotateY}deg)
        scale(${opts.scale})
    `
	}

	const transformSlides = (slides) => {
		const transformConfig = {
			default: { translateZ: 10, rotateY: 45, scale: 1.19 },
			prev: { translateZ: 10, rotateY: 45, scale: 1.19 },
			active: { translateZ: 0, rotateY: 0, scale: 0.955 },
			next: { translateZ: 10, rotateY: -45, scale: 1.19 },
		}

		slides.map((slide) => {
			const state =
				slide.classList.contains('slide-prev-duplicate') ||
				slide.classList.contains('slide-prev')
					? 'prev'
					: slide.classList.contains('slide-active-duplicate') ||
					  slide.classList.contains('slide-active')
					? 'active'
					: slide.classList.contains('slide-next-duplicate') ||
					  slide.classList.contains('slide-next')
					? 'next'
					: 'default'

			applyTransform(slide, transformConfig[state])
		})
	}

	const markActiveSlide = () => {
		const slides = Array.from(sliderWrapper.children)

		slides.map((slide) => {
			slide.classList.remove('slide-prev', 'slide-active', 'slide-next')
		})

		slides[slideIndex].classList.add('slide-prev')
		slides[slideIndex + 1].classList.add('slide-active')
		slides[slideIndex + 2].classList.add('slide-next')

		slides.map((slide) => {
			slide.classList.remove(
				'slide-prev-duplicate',
				'slide-active-duplicate',
				'slide-next-duplicate'
			)
		})

		const addDuplicateMinus = (index, suffix) => {
			if (slides[slideIndex - index]) {
				slides[slideIndex - index].classList.add(`slide-${suffix}-duplicate`)
			}
		}

		const addDuplicatePlus = (index, suffix) => {
			if (slides[slideIndex + index]) {
				slides[slideIndex + index].classList.add(`slide-${suffix}-duplicate`)
			}
		}

		addDuplicateMinus(1, 'next')
		addDuplicateMinus(2, 'active')
		addDuplicateMinus(3, 'prev')

		addDuplicatePlus(3, 'prev')
		addDuplicatePlus(4, 'active')
		addDuplicatePlus(5, 'next')

		transformSlides(slides)
	}

	const moveSlides = () => {
		markActiveSlide()

		const slide = sliderWrapper.querySelector('.slide')
		sliderWrapper.style.transform = `translate3d(-${
			slideIndex * slide.offsetWidth
		}px, 0, 0)`
	}

	const moveHandler = (direction) => {
		if (isMoving) return

		isMoving = true

		sliderWrapper.style.transition = `transform ${duration}ms ease-in-out`
		direction === 'left' ? (slideIndex -= 1) : (slideIndex += 1)

		moveSlides(slideIndex)
	}

	sliderWrapper.addEventListener('transitionend', () => {
		isMoving = false

		const newSlides = Array.from(sliderWrapper.children)

		if (slideIndex === 0) {
			sliderWrapper.style.transition = 'none'
			slideIndex = newSlides.length - 1 - slidesInView
			moveSlides()
		}
		if (slideIndex === newSlides.length - slidesInView) {
			sliderWrapper.style.transition = 'none'
			slideIndex = 1
			moveSlides()
		}
	})

	const mouseEvents = () => {
		arrowLeft.addEventListener('click', () => moveHandler('left'))
		arrowRight.addEventListener('click', () => moveHandler('right'))
	}

	const keyboardEvents = () => {
		const handleKeyUp = (e) => {
			switch (e.key) {
				case 'ArrowLeft':
					moveHandler('left')
					break
				case 'ArrowRight':
					moveHandler('right')
					break
			}
		}

		slider.addEventListener('mouseover', () => {
			window.addEventListener('keyup', handleKeyUp)
		})

		slider.addEventListener('mouseout', () => {
			window.removeEventListener('keyup', handleKeyUp)
		})
	}

	const initSlider = () => {
		cloneSlides()
		setSlidesBase()
		moveSlides()

		mouseEvents()
		keyboardEvents()
	}

	window.addEventListener('resize', () => {
		setSlidesBase()
	})

	initSlider()
}

window.addEventListener('load', () => {
	customSlider('custom_slider', {
		duration: 800,
		slidesInView: 3,
	})
})
