const VALID_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
const VALID_STATUSES = ['New', 'Investigating', 'Contained', 'Resolved', 'False Positive'];

function validateIncidentInput(data) {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 5) {
    errors.push('Title is required and must be at least 5 characters.');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters.');
  }

  if (!data.incident_type_id || isNaN(parseInt(data.incident_type_id, 10))) {
    errors.push('A valid incident classification type must be selected.');
  }

  if (!data.asset_id || isNaN(parseInt(data.asset_id, 10))) {
    errors.push('A valid targeted IT asset must be selected.');
  }

  if (!data.severity || !VALID_SEVERITIES.includes(data.severity)) {
    errors.push(`Severity must be one of: ${VALID_SEVERITIES.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateIncidentInput,
  VALID_SEVERITIES,
  VALID_STATUSES,
};

