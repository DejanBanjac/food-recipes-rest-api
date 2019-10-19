const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DEFAULT_CATEGORY_NAME = 'Uncategorized';

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        url: String,
        public_id: String
    }
});

categorySchema.statics.getDefaultCategory = function() {
    return this.findOne({ name: DEFAULT_CATEGORY_NAME })
        .then(foundCategory => {
            if(!foundCategory){
                foundCategory = new (mongoose.model('Category', categorySchema))({
                    name: DEFAULT_CATEGORY_NAME
                });
                return foundCategory.save({ validateBeforeSave: false });
            }
            else{                
                return foundCategory;
            }
        })
        .then(returnedCategory=>{
            return returnedCategory;
        })
        .catch(error => {
            console.log(error);
        });
};

module.exports = mongoose.model('Category', categorySchema);