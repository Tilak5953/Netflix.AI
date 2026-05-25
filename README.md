# TravelNook 
> A lightweight, responsive travel and itinerary booking platform built with pure HTML, CSS, and JavaScript.

TravelNook is a frontend project that provides a complete user experience for discovering holiday packages, viewing detailed itineraries, calculating trip costs, and registering users. It runs entirely in the browser without external libraries or frameworks.

## Features
* **Interactive Navigation**: Sticky header with scroll-based active state highlighting and a custom mobile slide-out menu.
* **Live Destination Directory**: Search and filter packages dynamically by category, keywords, or budget limits.
* **Itinerary Explorer**: Detailed modals showing day-by-day trip schedules, inclusions, and best times to visit using tabbed interfaces.
* **Dynamic Booking Calculator**: Calculates total package costs automatically based on guest counts.
* **Responsive Slider & Gallery**: A native testimonial carousel and an interactive photo lightbox with keyboard navigation.
* **Client-Side Validations**: Real-time validation checks for forms (email/phone formats) and a live password strength indicator on sign-up.
* **Toast Notification System**: Instant feedback popups for booking, form submissions, and wishlist updates.

---

## Tech Stack
* **HTML5**: Semantic document structure
* **CSS3**: Custom variables (design tokens), Flexbox, CSS Grid, and responsive breakpoints
* **JavaScript**: Modern ES6 features, DOM manipulation, custom event listeners
* **Icons**: FontAwesome 6 (via CDN)
* **Images**: High-quality travel photography curated from Unsplash

---

## Project Structure
```text
TravelNook/
├── index.html          # Homepage with hot destinations and testimonials
├── destinations.html   # Search, filters, and all package listings
├── upcoming-trips.html # Group schedules and booking calculator
├── about.html          # Brand story and key stats
├── contact.html        # Inquiry forms with validation patterns
├── login.html          # Login card layout
├── signup.html         # Signup layout with password strength checker
├── style.css           # Modern CSS custom properties, grid layouts, animations
└── script.js           # Core interactive JS components
