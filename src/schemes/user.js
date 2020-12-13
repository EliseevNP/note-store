export default {
  signup: {
    body: {
      username: {
        type: String,
        required: true,
        validate: (val) => val.length < 100,
      },
      password: {
        type: String,
        required: true,
        validate: (val) => val.length < 100,
      },
      name: {
        type: String,
        required: false,
        validate: (val) => val.length < 100,
      },
      secondName: {
        type: String,
        required: false,
        validate: (val) => val.length < 100,
      },
    },
  },
  signin: {
    body: {
      username: {
        type: String,
        required: true,
        validate: (val) => val.length < 100,
      },
      password: {
        type: String,
        required: true,
        validate: (val) => val.length < 100,
      },
    },
  },
  signout: {
    body: {
      fromAllDevices: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
  },
}
