// routes.ts

import { Router, Request, Response } from 'express';
import { ContactsController } from 'src/controllers/contacts-controller';
const router = Router();

router.get('/contacts', ContactsController.getContacts);
router.post('/contacts', ContactsController.addContact);
router.put('/contacts/:id', ContactsController.editContact);
router.delete('/contacts/:id', ContactsController.deleteContact);
router.get('/contacts/search', ContactsController.searchContacts);



export default router;