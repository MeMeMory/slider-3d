const customSlider = (name, opts) => {
	const slider = document.querySelector(`.${name}`)
	const sliderWrapper = slider.querySelector('.slider-wrapper')
	const slides = Array.from(sliderWrapper.children)
	const duration = opts.duration

	const arrowLeft = slider.querySelector(`.${opts.navigation.left}`)
	const arrowRight = slider.querySelector(`.${opts.navigation.right}`)

	let slideIndex = Math.round(slides.length / 2)
	let isMoving = false

	let slidesInView = opts.slidesInView

	const cloneSlides = () => {
		let cloneCount = Math.round(slidesInView / 2)

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
			default: { translateZ: 0, rotateY: 0, scale: 1.19 },
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

	const markSlides = () => {
		const slides = Array.from(sliderWrapper.children)

		const removeClasses = (slide, classes) => {
			classes.map((name) => slide.classList.remove(name))
		}

		const classesConfig = {
			base: ['slide-prev', 'slide-active', 'slide-next'],
			duplicate: [
				'slide-prev-duplicate',
				'slide-active-duplicate',
				'slide-next-duplicate',
			],
		}

		slides.map((slide) => removeClasses(slide, classesConfig.base))

		slides[slideIndex].classList.add('slide-prev')
		slides[slideIndex + 1].classList.add('slide-active')
		slides[slideIndex + 2].classList.add('slide-next')

		slides.map((slide) => removeClasses(slide, classesConfig.duplicate))

		const length = slides.length

		//check for start slides length
		if (length > 7) {
			const addDuplicate = (index, suffix) => {
				const targetIndex = Math.abs(index)

				const checkIfNotViewClass = slides[targetIndex]
					? !Array(...slides[targetIndex].classList).some((ass) => {
							return classesConfig.base.includes(ass)
					  })
					: false

				if (checkIfNotViewClass) {
					slides[targetIndex].classList.add(`slide-${suffix}-duplicate`)
				}
			}

			addDuplicate(3, 'next')
			addDuplicate(2, 'active')
			addDuplicate(1, 'prev')

			addDuplicate(-length + 2, 'next')
			addDuplicate(-length + 3, 'active')
			addDuplicate(-length + 4, 'prev')
		} else {
			const addDuplicate = (index, suffix) => {
				const targetIndex = slideIndex - index

				if (slides[targetIndex]) {
					slides[targetIndex].classList.add(`slide-${suffix}-duplicate`)
				}
			}

			addDuplicate(1, 'next')
			addDuplicate(2, 'active')
			addDuplicate(3, 'prev')

			addDuplicate(-3, 'prev')
			addDuplicate(-4, 'active')
			addDuplicate(-5, 'next')
		}

		transformSlides(slides)
	}

	const moveSlides = () => {
		markSlides()

		const slideWidth = sliderWrapper.querySelector('.slide').offsetWidth
		sliderWrapper.style.transform = `translate3d(-${
			slideIndex * slideWidth
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
		duration: 600,
		slidesInView: 3,
		navigation: {
			left: 'arrow_left',
			right: 'arrow_right',
		},
	})
})
