exports.paginateArray = (array, page, limit) => {
  // If both page and limit are null, return the entire array
  if (!page && !limit) {
    return array;
  }

  // Handle cases where limit is null or undefined (default to all items per page)
  limit = limit != null ? limit : array.length;

  // Handle cases where page is null or undefined (default to the first page)
  page = page != null ? page : 1;

  // Calculate the starting index of the items for the current page
  const startIndex = (page - 1) * limit;

  // Calculate the ending index for the current page
  const endIndex = startIndex + limit;

  // Get the items within the specified range
  const paginatedItems = array.slice(startIndex, endIndex);

  // Return the paginated items along with the total count and current page info
  return paginatedItems;
};
