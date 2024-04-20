import { Request, Response } from "express";
import mongoose from "mongoose";
import { Contact, IContact, ContactFieldsError, ContactValidationError, validateContact } from "src/models/contact";
import { ContactsService, ContactsServiceError } from "src/services/contacts-service";
import sendLog, { LogType } from "src/services/logger";
export class ResultData {
    data: any;
    message: string;
    constructor(data: any, message: string) {
        this.data = data;
        this.message = message;
    }
}
export class ContactsController {
    private static errorHandler = (error: Error | ContactValidationError | ContactFieldsError, res: Response): void => {
        if (error instanceof ContactValidationError) {
            sendLog({ type: LogType.SERVICE_ERROR, message: error.message, data: error })
            res.status(400).send(error.message);
        } else if (error instanceof ContactFieldsError) {
            sendLog({ type: LogType.SERVICE_ERROR, message: error.message, data: error })
            res.status(400).send(error.message);
        } else if (error instanceof ContactsServiceError) {
            sendLog({ type: LogType.SERVICE_ERROR, message: error.message, data: error })
            res.status(error.status).send(error.message);
        } else {
            sendLog({ type: LogType.SERVICE_ERROR, message: 'Internal server error', data: error })
            res.status(500).send('Internal server error');
        }
    }
    public static async getContact(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new ContactValidationError('Id is required');
            }
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ContactsServiceError('Invalid ID');
            }
            const contact = await ContactsService.getContact(id);
            sendLog({ type: LogType.SERVICE_INFO, message: 'Contact retrieved', data: contact })
            res.status(200).send(contact);
        } catch (error) {
            ContactsController.errorHandler(error, res);
        }
    }
    public static async addContact(req: Request, res: Response): Promise<void> {
        try {
            const contact: IContact = req.body;
            validateContact(contact);
            const newContact = await ContactsService.addContact(contact);
            sendLog({ type: LogType.SERVICE_INFO, message: 'New contact added', data: newContact })
            res.status(201).send(newContact);
        } catch (error) {
            ContactsController.errorHandler(error, res);
        }
    }
    public static async getContacts(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            let limit = Math.min(parseInt(req.query.limit as string) || 10, 10);
            const contacts = await ContactsService.getContacts(page, limit);

            sendLog({
                type: LogType.SERVICE_INFO, message: 'Contacts retrieved', data:
                {
                    page,
                    limit,
                    contactsFound: contacts.length,
                    contacts
                }
            })
            res.status(200).send(contacts);
        } catch (error) {
            ContactsController.errorHandler(error, res);
        }
    }
    public static async editContact(req: Request, res: Response): Promise<void> {
        try {
            const contact: IContact = req.body ?? {};
            const { id } = req.params;
            if (!id) {
                throw new ContactValidationError('Id is required');
            }
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ContactsServiceError('Invalid ID');
            }
            validateContact(contact);

            const updatedContact = await ContactsService.editContact(req.params.id, contact);
            sendLog({ type: LogType.SERVICE_INFO, message: 'Contact updated', data: updatedContact })
            res.status(200).send(updatedContact);
        } catch (error) {
            ContactsController.errorHandler(error, res);
        }
    }
    public static async deleteContact(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new ContactValidationError('Id is required');
            }
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ContactsServiceError('Invalid ID');
            }
            const deletedContact = await ContactsService.deleteContact(id);
            sendLog({ type: LogType.SERVICE_INFO, message: 'Contact deleted', data: { id } })
            res.status(200).send(deletedContact);
        } catch (error) {
            ContactsController.errorHandler(error, res);
        }
    }
    public static async searchContacts(req: Request, res: Response): Promise<void> {
        try {
            const q = req.query.q as string;
            if (!q) {
                throw new ContactValidationError('Query is required, use ?q=[search term] in the URL');
            }
            const contacts = await ContactsService.searchContacts(q);
            sendLog({ type: LogType.SERVICE_INFO, message: 'Contacts searched', data: { q, contacts } })
            res.status(200).send(contacts);
        } catch (error) {
            ContactsController.errorHandler(error, res);
        }
    }
}