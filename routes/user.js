const router = require('express').Router();
const { validate, authorize,upload } = require('../middelwares');
const { user } = require('../controllers');
const { loginSchema,registerSchema, createCollectionSchema, addLayerSchema, getLayersSchema, uploadImagesSchema, getImagesSchema } = require('../validations/user');
const APP_CONSTANTS = require('../constant/APP_CONSTANTS');

router.post('/login', validate(loginSchema), user.login);
router.post('/register', validate(registerSchema), user.register);
router.use(authorize(APP_CONSTANTS.USER_TYPE.USER));
router.post('/collection', validate(createCollectionSchema), user.createCollection);
router.get('/getCollections', user.getCollections);
router.post('/addLayer', validate(addLayerSchema), user.addLayer);
router.get('/getLayers', validate(getLayersSchema), user.getLayers);
router.post('/uploadImages', validate(uploadImagesSchema), upload, user.uploadImages);
router.get('/getImages', validate(getImagesSchema), user.getImages)

module.exports = router; 