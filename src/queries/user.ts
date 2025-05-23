export const userQueries = {
  createUser: `
    CREATE (u:User {
      id: $userId,
      username: $username,
      email: $email,
      password: $hashedPassword,
      role: $role,
      createdAt: $now,
      updatedAt: $now
    })
    RETURN u
  `,

  findByEmail: `
    MATCH (u:User {email: $email}) 
    RETURN u
  `,

  findById: `
    MATCH (u:User {id: $userId})
    RETURN u
  `,

  findByUsername: `
    MATCH (u:User {username: $username})
    RETURN u
  `,
};
