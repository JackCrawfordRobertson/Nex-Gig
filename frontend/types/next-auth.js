/**
 * @type {import("next-auth").Session}
 * @augments {import("next-auth").Session}
 */
const extendedSession = {
    user: {
      id: '',
      firstName: '',
      lastName: '',
      profilePicture: '',
      subscribed: false,
      onTrial: false,
      subscriptionId: '',
      subscriptionStartDate: '',
      trialEndDate: ''
    }
  };
  
  module.exports = {};