// for the basic info
export const BASIC_INFO_QUERY = `
    query {
        user {
            id
            login
            firstName
            lastName
            email
            campus
        }
    }
`;

// for the last projects
export const LAST_PROJECTS_QUERY = `
    {
        transaction(
            where: {
                type: { _eq: "xp" }
                _and: [
                    { path: { _like: "/bahrain/bh-module%" } },
                    { path: { _nlike: "/bahrain/bh-module/checkpoint%" } },
                    { path: { _nlike: "/bahrain/bh-module/piscine%" } }
                ]
            }
            order_by: { createdAt: desc }
            limit: 4
        ) {
            object {
                type
                name
            }
        }
    }
`;

// for the xp
export const XP_QUERY = (userId) => `
    query Transaction_aggregate {
        transaction_aggregate(
            where: {
                event: { path: { _eq: "/bahrain/bh-module" } }
                type: { _eq: "xp" }
                userId: { _eq: "${userId}" }
            }
        ) {
            aggregate {
                sum {
                    amount
                }
            }
        }
    }
`;
// for the audit ratio
export const AUDIT_RATIO_QUERY = `
    {
        user {
            totalUp
            totalDown
            auditRatio
        }
    }
`;
// for the best skills
export const SKILLS_QUERY = `
    {
        user {
            transactions(
                where: {
                    type: {_ilike: "%skill%"}
                },
                order_by: {amount: desc}
            ) {
                type
                amount
            }
        }
    }
`;
// for the tech skills
export const TECH_SKILLS_QUERY = `
    {
        user {
            transactions(where: {
                type: {_ilike: "%skill%"}
            }) {
                type
                amount
            }
        }
    }
`;
