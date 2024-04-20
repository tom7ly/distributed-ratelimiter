import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
    _id?: string;
    firstName: string;
    lastName: string;
    phone: string;
    creationDate: Date;
    address: string;
}
const ContactSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    creationDate: { type: Date, default: Date.now },
    address: { type: String, required: true },
});


ContactSchema.index({ firstName: 'text', lastName: 'text', address: 'text', phone: 'text' });

type ContactDocumentKeys = keyof IContact;
type DocumentKeys = keyof Document;
type ContactKeys = Exclude<ContactDocumentKeys, DocumentKeys>;
const excludedKeys = ['_id', 'creationDate'];
const contactKeysSet = new Set((Object.keys(ContactSchema.paths)).filter(key => !excludedKeys.includes(key)));

function isIContact(object: any): object is IContact {
    return 'firstName' in object && typeof object.firstName === 'string'
        && 'lastName' in object && typeof object.lastName === 'string'
        && 'phone' in object && typeof object.phone === 'string'
        && 'address' in object && typeof object.address === 'string';
}
function getInvalidFields(object: any): string[] {
    const invalidFields: string[] = [];

    if (!('firstName' in object && typeof object.firstName === 'string')) {
        invalidFields.push('firstName');
    }
    if (!('lastName' in object && typeof object.lastName === 'string')) {
        invalidFields.push('lastName');
    }
    if (!('phone' in object && typeof object.phone === 'string')) {
        invalidFields.push('phone');
    }
    if (!('address' in object && typeof object.address === 'string')) {
        invalidFields.push('address');
    }

    return invalidFields;
}
export class ContactValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ContactFieldsError extends ContactValidationError {
    constructor(fields: string[]) {
        super(`Missing required fields: [${fields.join(', ')}]`);
    }
}

export function validateContact(contact: any): contact is IContact {
    const invalidFields = getInvalidFields(contact);

    if (invalidFields.length > 0) {
        throw new ContactValidationError(`Invalid fields: [${invalidFields.join(', ')}]`);
    }

    const missingFields = Array.from(contactKeysSet).filter((field) => contact[field] === undefined);
    if (missingFields.length > 0) {
        throw new ContactFieldsError(missingFields);
    }

    return true;
}

export function validatePartialContact(contact: Partial<IContact>): contact is Partial<IContact> {
    const optionalFields: ContactKeys[] = (Object.keys(contact) as ContactKeys[]);
    if (optionalFields.length === 0) {
        throw new ContactValidationError('At least one field should be provided');
    }
    for (let field of optionalFields) {
        if (!contactKeysSet.has(field)) {
            throw new ContactValidationError(`Invalid field: ${field}`);
        }
    }
    return true;
}


export const Contact = mongoose.model<IContact>('Contact', ContactSchema);

