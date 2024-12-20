class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Example of a full query: /api/v1/tours?sort=-price&fields=name,price,ratingsAverage&limit=10&page=2
  // queryString example: 
  // {
  //   limit: '5',
  //   sort: '-ratingsAverage,price',
  //   fields: 'name,price,ratingsAverage,summary,difficulty'
  // }
  // query: is the mongoose query

  // URL: /api/v1/tours?price[gte]=500
  // Before replace: {"price": {"gte": "500"}}
  // After replace:  {"price": {"$gte": "500"}}
  
  filter() {
    const queryObj = { ...this.queryString };  //This makes a copy of the original querystring
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);  //[gte] => [$gte]

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
