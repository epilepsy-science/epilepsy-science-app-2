import { retryableBefore } from "../support/retryableBefore.js"

describe('Homepage', { testIsolation: false }, function () {
  retryableBefore(function () {
    cy.visitLoadedPage('')
  })

  beforeEach(function () {
    cy.intercept('**/query?**').as('query')
  })

  it(`Portal Target is ${Cypress.config().baseUrl}`, function () { })

  it('Navigation Bar', function () {
    // Check for navigation bar
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(1) > a').should('contain', 'Data & Models').and('have.attr', 'href', '/data?type=dataset')
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(2) > a').should('contain', 'SPARC Apps').and('have.attr', 'href', '/apps')
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(3) > a').should('contain', 'Tools & Resources').and('have.attr', 'href', '/tools-and-resources')
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(4) > a').should('contain', 'News & Events').and('have.attr', 'href', '/news-and-events')
    cy.get(':nth-child(1) > :nth-child(5) > a').should('contain', 'About').and('have.attr', 'href', '/about')
    cy.get(':nth-child(1) > :nth-child(6) > a').should('contain', 'Submit to SPARC').and('have.attr', 'href', '/share-data')
  })

  it('Page hero', function () {
    // Check for banner
    cy.get('h1').should('contain', 'SPARC')
    cy.get('[class="page-hero-img"]').should('exist')
  })

  it('Portal features', function () {
    // Check for the number of features
    cy.get('.feature-container').should('have.length', 4)

    // Check for feature card
    cy.get(':nth-child(1) > .feature-container').within(() => {
      cy.get('.icon').should('exist')
      cy.get('.heading2').should('exist')
      cy.get('.body1').should('exist')
      cy.get('.button-link > .el-button > span').should('exist')
    })

    // Check for button function
    cy.get(':nth-child(1) > .feature-container > .button-link > .el-button').click()

    cy.wait('@query', { timeout: 20000 })
    cy.waitForLoadingMask()

    cy.url().should('contain', 'data?type=dataset')
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(1) > a', { timeout: 30000 }).should('have.class', 'active')
    cy.go('back')

    cy.waitForLoadingMask()

  })

  it('Projects and datasets', function () {
    // Check for content title
    cy.get('.section-container.py-32 > .heading2').should('contain', 'Resources & Datasets')

    // Check for card description
    cy.get('.row > :nth-child(1) > .mb-16').should('contain', 'you might be interested in:')
    cy.get('.row > :nth-child(2) > .mb-16').should('have.text', 'Featured Datasets')

    // Check for card content
    cy.get(':nth-child(1) > .card-container').within(() => {
      cy.get('.subpage-row > :nth-child(1) > .image-container > .banner-image').should('exist')
      cy.get('.subpage-row > :nth-child(2) > .dataset-name').should('exist')
      cy.get('.subpage-row > :nth-child(2) > .dataset-description').should('exist')
      cy.get('.subpage-row > :nth-child(2) > .button-link > .el-button').should('exist')
    })

    // Check for card 'view all' link
    cy.get('.row > :nth-child(1) > .view-all-link').should('contain', 'View All')
    cy.get(':nth-child(2) > .view-all-link').should('contain', 'View All Datasets')

    // Check for button redirect to dataset
    cy.get(':nth-child(2) > .card-container > .subpage-row > :nth-child(2) > .dataset-name').then(($link) => {
      const title = $link.text().replace('\n', '').trim()
      cy.wrap($link).siblings('.button-link').click()

      cy.wait('@query', { timeout: 20000 })
      cy.waitForLoadingMask()

      cy.get('.el-col-sm-16 > .heading2').should('contain', title)
    })
    cy.go('back')

    cy.waitForLoadingMask()
  })

  it('Homepage news', function () {
    cy.visitLoadedPage('')
    // Check for content title
    cy.get('.featured-datasets > .heading2').should('contain', 'News & Upcoming Events')

    // Check for card image
    cy.get('.sparc-card__image').should('exist')

    // Check for card title
    cy.get('h3 > a').should('exist')

    // Check for card subtitle
    cy.get('.markdown-text > p').should('exist')
    cy.get(':nth-child(2) > .el-button').should('contain', 'Learn More')

    // Check for card 'view all' link
    cy.get('.sparc-card__content-wrap__content > .view-all-link').should('exist')
  })

  it('Stay connected', function () {
    // Check for content title
    cy.get('.subheader').should('have.text', 'Stay Connected')

    // Check for content
    cy.get('.newsletter-wrap > .heading2').should('have.text', 'Sign up for the SPARC Newsletter')
    cy.get('.connect-with-us-column > .heading2').should('have.text', 'Open Office Hours')
  })

  it('Footer', function () {
    cy.get('.footer__links > :nth-child(1) > :nth-child(1) > h3').should('have.text', 'Learn More')
    cy.get(':nth-child(1) > :nth-child(2) > h3').should('have.text', 'Policies')
    cy.get(':nth-child(2) > :nth-child(1) > h3').should('have.text', 'Help Us Improve')
    cy.get(':nth-child(2) > :nth-child(2) > h3').should('have.text', 'Stay Up-to-Date')
    cy.get('.footer__info--logo > .router-link-active > .logo').should('have.attr', 'alt').and('contain', 'Logo for SPARC')
    cy.get('.footer__info--blurb > p').should('contain', 'The open community platform for bridging the body and the brain through neuroscience and systems physiology data, computational and spatial modeling, and device design.')
  })
})
