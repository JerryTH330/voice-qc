(function (global, factory) {
  const api = factory();
  global.__factorySOPStatusUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const ALL_OPTION = '全部';

  function unique(values) {
    return [...new Set(values)];
  }

  function normalizeSOPLeadStatuses(statuses, options, fallback = [ALL_OPTION]) {
    const allowedOptions = Array.isArray(options) ? options : [];
    const list = Array.isArray(statuses)
      ? unique(statuses.filter((status) => allowedOptions.includes(status)))
      : [];
    const fallbackList = Array.isArray(fallback)
      ? unique(fallback.filter((status) => allowedOptions.includes(status)))
      : [ALL_OPTION].filter((status) => allowedOptions.includes(status));

    if (!list.length) {
      return fallbackList.length ? fallbackList : [ALL_OPTION];
    }

    if (list.includes(ALL_OPTION)) {
      return [ALL_OPTION];
    }

    return list;
  }

  function toggleSOPLeadStatusSelection(currentSelection, status, options, fallback = [ALL_OPTION]) {
    const normalized = normalizeSOPLeadStatuses(currentSelection, options, fallback);
    if (status === ALL_OPTION) {
      return [ALL_OPTION];
    }

    const nextSelection = normalized.includes(ALL_OPTION) ? [] : [...normalized];
    const targetIndex = nextSelection.indexOf(status);

    if (targetIndex >= 0) {
      nextSelection.splice(targetIndex, 1);
    } else {
      nextSelection.push(status);
    }

    return normalizeSOPLeadStatuses(nextSelection, options, fallback);
  }

  function getSOPLeadStatusOptionState(selection, status, options, fallback = [ALL_OPTION]) {
    const normalized = normalizeSOPLeadStatuses(selection, options, fallback);
    const specificOptions = (Array.isArray(options) ? options : []).filter((option) => option !== ALL_OPTION);
    const isAllSelected = normalized.includes(ALL_OPTION);

    if (status === ALL_OPTION) {
      const isIndeterminate = !isAllSelected && normalized.some((option) => specificOptions.includes(option));
      return {
        isActive: isAllSelected,
        isIndeterminate,
        ariaChecked: isIndeterminate ? 'mixed' : (isAllSelected ? 'true' : 'false')
      };
    }

    const isActive = isAllSelected ? specificOptions.includes(status) : normalized.includes(status);
    return {
      isActive,
      isIndeterminate: false,
      ariaChecked: isActive ? 'true' : 'false'
    };
  }

  return {
    normalizeSOPLeadStatuses,
    toggleSOPLeadStatusSelection,
    getSOPLeadStatusOptionState
  };
});
