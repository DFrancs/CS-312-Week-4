//jshint esversion:6

// Function to get the full date
exports.getDate = function() {
    const today = new Date();
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };
    return today.toLocaleDateString('en-US', options);
};

// Function to get only the day of the week
exports.getDay = function() {
    const today = new Date();
    const options = {
        weekday: 'long'
    };
    return today.toLocaleDateString('en-US', options);
};
