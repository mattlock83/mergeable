const { Action } = require('./action')

const reviewComment = '**Mergeable Results**'
const staleResultComment = 'Mergeable results outdated'

const addReview = async (context, prNumber, reviewBody, eventType) => {
  return context.github.pulls.createReview(
    context.repo({ pull_number: prNumber, body: reviewBody, event: eventType })
  )
}

const getMergeableRequestChangesReviews = async (context, prNumber) => {
  const reviews = await context.github.pulls.listReviews(
    context.repo({ pull_number: prNumber })
  )
  const botName = process.env.APP_NAME ? process.env.APP_NAME : 'Mergeable'
  return reviews.data.filter(review => (review.user.login.toLowerCase() === `${botName.toLowerCase()}[bot]` && review.state === 'CHANGES_REQUESTED' && review.body.startsWith(reviewComment)))
}

const dismissReviews = async (context, prNumber, mergeableReviews) => {
  for (let review of mergeableReviews) {
    await context.github.pulls.dismissReview(
      context.repo({ pull_number: prNumber, review_id: review.id, message: staleResultComment })
    )
  }
}

const updateReviewComments = async (context, prNumber, mergeableReviews) => {
  for (let review of mergeableReviews) {
    await context.github.pulls.updateReview(
      context.repo({ pull_number: prNumber, review_id: review.id, body: staleResultComment })
    )
  }
}

class ResultsAsReview extends Action {
  constructor () {
    super('results_as_review')
    this.supportedEvents = [
      'pull_request.*'
    ]
  }

  // there is nothing to do
  async beforeValidate () {}

  async afterValidate (context, settings, name, results) {
    const payload = this.getPayload(context)
    const prNumber = payload.number

    // Dismiss any old reviews left by the github actions bot user
    const oldReviews = await getMergeableRequestChangesReviews(context, prNumber)
    await updateReviewComments(context, prNumber, oldReviews)
    await dismissReviews(context, prNumber, oldReviews)


    // Add a request changes review and a comment with the failures
    if (results.validationStatus === 'fail') {
      const validationErrors = []
      results.validationSuites.forEach(val => {
        val.validations.forEach(el => {
          if (el.status === 'fail') {
            validationErrors.push(' - ' + el.description)
          }
        })
      })
      return addReview(
        context,
        prNumber,
        reviewComment + '\n' + validationErrors.join('\n'),
        'REQUEST_CHANGES'
      )
    }
  }
}

module.exports = ResultsAsReview
