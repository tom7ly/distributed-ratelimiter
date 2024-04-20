import { IContact, Contact, validatePartialContact } from "src/models/contact";

export class ContactsServiceError extends Error {
    status: number;
    constructor(message: string = "Contacts service error", status: number = 500) {
        super(message);
        this.name = "ContactsServiceError";
        this.message = message;
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ContactNotFoundError extends ContactsServiceError {
    constructor(message: string) {
        super(message, 404);
        this.name = "ContactNotFoundError";
    }
}

export class ContactsService {
    public static async getContact(id: string): Promise<IContact> {
        return Contact.findById(id)
            .then((contact) => {
                if (!contact) {
                    throw new ContactNotFoundError(`Contact with id ${id} not found`);
                }
                return contact;
            })
            .catch((err) => {
                throw new ContactsServiceError(err.message);
            });
    }

    public static async addContact(contact: IContact): Promise<IContact> {
        const newContact = new Contact(contact);
        return newContact.save();
    }

    public static async getContacts(page: number, limit: number): Promise<IContact[]> {
        return Contact.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .then((contacts) => {
                return contacts;
            })
            .catch((err) => {
                throw new ContactsServiceError(err.message);
            });
    }

    public static async editContact(id: string, contact: IContact): Promise<IContact> {

        return Contact.findByIdAndUpdate(id, contact, { new: true })
            .then((updatedContact) => {
                const { id: _, creationDate: __, ...contactToUpdate } = contact;
                if (!updatedContact) {
                    throw new ContactNotFoundError(`Contact with id ${id} not found`);
                }
                return updatedContact;
            })
            .catch((err) => {
                throw new ContactsServiceError(err.message);
            });
    }

    public static async deleteContact(id: string): Promise<IContact> {
        return Contact.findByIdAndDelete(id)
            .then((deletedContact) => {
                if (!deletedContact) {
                    throw new ContactNotFoundError(`Contact with id ${id} not found`);
                }
                return deletedContact;
            })
            .catch((err) => {
                throw new ContactsServiceError(err.message);
            });
    }

    public static async searchContacts(query: string): Promise<IContact[]> {
        return Contact.find({ $text: { $search: query } })
            .then((contacts) => {
                return contacts;
            })
            .catch((err) => {
                throw new ContactsServiceError(err.message);
            });
    }
}
