export default {
  secret: 'SECRET_KEY_RANDOM',
  tokens: {
    access: {
      type: 'access',
      expiresIn: '12h',
    },
    refresh: {
      type: 'refresh',
    },
  },
};
