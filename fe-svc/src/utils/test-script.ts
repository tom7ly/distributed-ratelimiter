import axios from "axios";
import { svcConfig } from "../config";

const axiosClient = axios.create({
    baseURL: svcConfig.GATEWAYLB_URL + '/api',
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface IContact {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
}
export class Contact implements IContact {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    constructor(contact: IContact) {
        this.firstName = contact.firstName;
        this.lastName = contact.lastName;
        this.phone = contact.phone;
        this.address = contact.address;
    }
}
const randomContact = () => {
    const firstNames: string[] = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Ryan', 'Sara', 'Tom', 'Uma', 'Vince', 'Wendy']
    const lastNames: string[] = ['Smith', 'Taylor', 'Brown', 'Wilson', 'Evans', 'Patel', 'Khan', 'Ali', 'Singh', 'Nguyen', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Reyes', 'Morales', 'Jimenez']
    const phoneNumbers: string[] = ['+1234567890', '+2345678901', '+3456789012', '+4567890123', '+5678901234', '+6789012345', '+7890123456', '+8901234567', '+9012345678', '+0123456789']
    const addresses: string[] = ['123 Main St', '456 Elm St', '789 Oak St', '012 Pine St', '345 Maple St', '678 Cedar St', '901 Walnut St', '234 Birch St', '567 Spruce St', '890 Ash St']
    const randomValue = (values: string[]): string => {
        return values[Math.floor(Math.random() * values.length)]
    }
    return new Contact({
        firstName: randomValue(firstNames),
        lastName: randomValue(lastNames),
        phone: randomValue(phoneNumbers),
        address: randomValue(addresses),
    })
}


const addContact = async (contact: IContact) => {
    const response = await axiosClient.post('/contacts', contact);
    return response.data;
}

const editContact = async (id:string,contact: IContact) => {
    const response = await axiosClient.put(`/contacts/${id}`,{contact});
    return response.data;
}

const deleteContact = async (id: string) => {
    const response = await axiosClient.delete(`/contacts/${id}`);
    return response.data;
}

const getContact = async (id: string) => {
    const response = await axiosClient.get(`/contacts/${id}`);
    return response.data;
}

const getContacts = async (limit: number, page: number) => {
    const query = `?limit=${limit}&page=${page}`;
    const response = await axiosClient.get(`/contact${query}`)
    return response.data;
}

const searchContacts = async (query: string) => {
    const response = await axiosClient.get(`/contact/search/${query}`);
    return response.data;
}

export const testScript = async () => {
    const contact = randomContact();
    console.log('Adding contact:', contact);
    const addedContact = await addContact(contact);
    console.log('Added contact:', addedContact);

    console.log('Editing contact:', addedContact);
    const contactToEdit= randomContact();
    const editedContact = await editContact(addedContact._id,contactToEdit)
    console.log('Edited contact:', editedContact);

    console.log('Getting contact:', editedContact._id);
    const fetchedContact = await getContact(editedContact._id);
    console.log('Fetched contact:', fetchedContact);

    console.log('Searching for contacts:', contact.firstName);
    const searchResults = await searchContacts(contact.firstName);
    console.log('Search results:', searchResults);

    console.log('Deleting contact:', fetchedContact._id);
    const deletedContact = await deleteContact(fetchedContact._id);
    console.log('Deleted contact:', deletedContact);

    console.log('Getting all contacts');
    await getContacts(10, 1);
}
