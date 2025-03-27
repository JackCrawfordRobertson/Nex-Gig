// app/mock/users.js (not src/mock/users.js)
const createMockUser = (overrides = {}) => ({
    "demo-user-id": {
        email: "alice@example.com",
        jobLocations: ["London", "Remote"],
        jobTitles: ["Junior Developer", "Product Designer"],
        jobs: {},
        ifyoucould: [
            {
                company: "Paramount Comedy",
                date_added: "2025-03-19",
                date_posted: "2025-03-16",
                has_applied: false,
                location: "London, England, United Kingdom",
                salary: "Not Provided",
                title: "Product Designer, Softlines",
                url: "https://uk.linkedin.com/jobs/view/product-designer-softlines-at-paramount-comedy-4183787371",
            },
            {
                company: "Fresha",
                date_added: "2025-03-19",
                date_posted: "2025-03-16",
                has_applied: false,
                location: "Greater London, England, United Kingdom",
                salary: "Not Provided",
                title: "Product Designer (UX/UI)",
                url: "https://uk.linkedin.com/jobs/view/product-designer-ux-ui-at-fresha-4140124691",
            },
            {
                company: "Fresha",
                date_added: "2025-03-19",
                date_posted: "2025-03-16",
                has_applied: false,
                location: "Greater London, England, United Kingdom",
                salary: "Not Provided",
                title: "Product Designer (UX/UI)",
                url: "https://uk.linkedin.com/jobs/view/product-designer-ux-ui-at-fresha-4140124691",
            },
        ],
        linkedin: [
            {
                company: "Meta",
                date_added: "2025-03-19",
                date_posted: "2025-03-07",
                has_applied: false,
                location: "London, England, United Kingdom",
                salary: "Not Provided",
                title: "Product Designer",
                url: "https://uk.linkedin.com/jobs/view/product-designer-at-meta-4176826244",
            },

            {
                company: "American Express Global Business Travel",
                date_added: "2025-03-19",
                date_posted: "2025-03-16",
                has_applied: false,
                location: "London, England, United Kingdom",
                salary: "Not Provided",
                title: "Product Designer",
                url: "https://uk.linkedin.com/jobs/view/product-designer-at-american-express-global-business-travel-4139783057",
            },
        ],
        unjobs: [
            {
                company: "UN Jobs",
                date_added: "2025-03-19",
                has_applied: false,
                location: "London",
                title: "UX Product Designer / Engineer, Global, Remote",
                url: "https://unjobs.org/vacancies/1742125352924",
            },
            {
                company: "UN Jobs",
                date_added: "2025-03-19",
                has_applied: false,
                location: "London",
                title: "Product Designer II, India",
                url: "https://unjobs.org/vacancies/1740778427445",
            },
            {
                company: "UN Jobs",
                date_added: "2025-03-19",
                has_applied: false,
                location: "London",
                title: "UX Product Designer / Engineer, Global, Remote",
                url: "https://unjobs.org/vacancies/1742125352924",
            },
            {
                company: "UN Jobs",
                date_added: "2025-03-19",
                has_applied: false,
                location: "London",
                title: "Product Designer II, India",
                url: "https://unjobs.org/vacancies/1740778427445",
            },
        ],
        workable: [
            {
                company: "Paramount Comedy",
                date_added: "2025-03-19",
                date_posted: "2025-03-16",
                has_applied: false,
                location: "London, England, United Kingdom",
                salary: "Not Provided",
                title: "Product Designer, Softlines",
                url: "https://uk.linkedin.com/jobs/view/product-designer-softlines-at-paramount-comedy-4183787371",
            },
            {
                company: "Fresha",
                date_added: "2025-03-19",
                date_posted: "2025-03-16",
                has_applied: false,
                location: "Greater London, England, United Kingdom",
                salary: "Not Provided",
                title: "Product Designer (UX/UI)",
                url: "https://uk.linkedin.com/jobs/view/product-designer-ux-ui-at-fresha-4140124691",
            },
            {
                company: "Fresha",
                date_added: "2025-03-19",
                date_posted: "2025-03-16",
                has_applied: false,
                location: "Greater London, England, United Kingdom",
                salary: "Not Provided",
                title: "Product Designer (UX/UI)",
                url: "https://uk.linkedin.com/jobs/view/product-designer-ux-ui-at-fresha-4140124691",
            },
        ],
        // Subscription data in user object
        subscribed: true,
        subscriptionId: "I-84BSFMUWGGL1",
        subscriptionPlan: "paypal",
        subscriptionStartDate: "2025-03-20T18:42:23.719Z",
        trialEndDate: "2025-03-27T18:42:23.719Z",
        onTrial: true,
        profileVisibility: "private",
        marketingConsent: false,
        notifications: true,
        profilePicture: 'https://res.cloudinary.com/dfsznxwhz/image/upload/v1742992744/nextgig-logo_nqjhvq.svg',
        firstName: 'Alice',
        lastName: 'Smith',
        userIP: "92.28.117.205",
        updatedAt: "2025-03-26T13:19:55.114Z"
    },
});

export const mockSession = {
    user: createMockUser()
  };
  
  export const mockUsers = {
    "demo-user-id": createMockUser()
  };
  
  export default mockUsers;