export default {
  create: {
    body: {
      title: {
        type: String,
        required: true,
        validate: (val) => val.length < 1000,
      },
    },
  },
  update: {
    params: {
      id: {
        type: Number,
        required: true,
      },
    },
    body: {
      title: {
        type: String,
        required: true,
        validate: (val) => val.length < 1000,
      },
    },
  },
  delete: {
    params: {
      id: {
        type: Number,
        required: true,
      },
    },
  },
  getPage: {
    query: {
      pageSize: {
        type: Number,
        required: false,
        default: 100,
        validate: (val) => val >= 0 && val <= 100,
      },
      pageNumber: {
        type: Number,
        required: false,
        default: 1,
        validate: (val) => val >= 1,
      },
    },
  },
  createLink: {
    params: {
      id: {
        type: Number,
        required: true,
      },
    },
  },
  getByLink: {
    params: {
      link: {
        type: String,
        required: true,
      },
    },
  },
}
