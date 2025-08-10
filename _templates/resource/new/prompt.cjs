module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Resource name (kebab-case):',
    validate: (value) => {
      if (!/^[a-z]+(-[a-z]+)*$/.test(value)) {
        return 'Name must be kebab-case (e.g., my-resource-name)';
      }
      return true;
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'Short description:',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Description is required';
      }
      return true;
    }
  }
];