// Validation middleware factory
export const validateRequest = (schema) => {
  return (req, res, next) => {
    // Combine all request properties that might need validation
    const dataToValidate = {
      body: req.body,
      query: req.query,
      params: req.params
    };

    try {
      // Validate request data against the provided schema
      const { error } = schema.validate(dataToValidate, {
        abortEarly: false, // Include all errors
        allowUnknown: true // Allow unknown keys that will be ignored
      });

      if (error) {
        // Format validation errors
        const errors = error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          error: 'Validation Error',
          details: errors
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

// Common validation schemas
export const contentValidation = {
  create: {
    body: {
      title: {
        type: 'string',
        required: true,
        min: 1,
        max: 255
      },
      description: {
        type: 'string',
        optional: true,
        max: 1000
      },
      type: {
        type: 'string',
        required: true,
        enum: ['announcement', 'promotion', 'schedule', 'other']
      },
      mediaUrl: {
        type: 'string',
        optional: true,
        format: 'uri'
      },
      displayOrder: {
        type: 'number',
        optional: true,
        min: 0
      },
      startDate: {
        type: 'date',
        optional: true
      },
      endDate: {
        type: 'date',
        optional: true
      }
    }
  },
  update: {
    params: {
      id: {
        type: 'number',
        required: true,
        min: 1
      }
    },
    body: {
      title: {
        type: 'string',
        optional: true,
        min: 1,
        max: 255
      },
      description: {
        type: 'string',
        optional: true,
        max: 1000
      },
      type: {
        type: 'string',
        optional: true,
        enum: ['announcement', 'promotion', 'schedule', 'other']
      },
      mediaUrl: {
        type: 'string',
        optional: true,
        format: 'uri'
      },
      isActive: {
        type: 'boolean',
        optional: true
      },
      displayOrder: {
        type: 'number',
        optional: true,
        min: 0
      }
    }
  }
};

export const statusValidation = {
  update: {
    body: {
      isOnAir: {
        type: 'boolean',
        required: true
      },
      statusMessage: {
        type: 'string',
        optional: true,
        max: 255
      },
      updatedBy: {
        type: 'string',
        optional: true,
        max: 100
      }
    }
  }
};

export const scheduleValidation = {
  updateStatus: {
    params: {
      id: {
        type: 'number',
        required: true,
        min: 1
      }
    },
    body: {
      status: {
        type: 'string',
        required: true,
        enum: ['pending', 'ongoing', 'completed']
      }
    }
  }
};
