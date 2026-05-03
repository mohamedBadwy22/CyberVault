"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { ToastContainer, toast } from 'react-toastify';

const contactSchema = zod.object({
  email: zod.email("Please enter a valid email address"),
  subject: zod.string().min(3, "Subject must be at least 3 characters long").max(100, "Subject must be less than 100 characters long"),
  message: zod.string().min(10, "Message must be at least 10 characters long").max(500, "Message must be less than 500 characters long"),
});


export default function contact() {
  const form = useForm({
    defaultValues: {
      email: "",
      subject: "",
      message: "",
    },
    resolver: zodResolver(contactSchema),
  })

  let { register, handleSubmit , formState } = form;

  
  async function submitForm (data:{email: string, subject: string, message: string}) {
    const res = await fetch('api/contactAPI',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    let responseData = await res.json();
    responseData.status === "success" ? toast.success(responseData.message) : toast.error(responseData.message);
    form.reset();
  }

  return (
    <>
      <section className="container mx-auto">
        <div className="py-8 lg:py-16 px-4 mx-auto max-w-3xl">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 ">
            Contact Us
          </h2>
          <p className="mb-8 lg:mb-16 font-light text-center text-gray-500  sm:text-xl">
            Got a technical issue? Want to send feedback about a beta feature?
            Need details about our Business plan? Let us know.
          </p>


          <form action="#" id="contactForm" className="space-y-8" onSubmit={handleSubmit((data)=>submitForm(data))}>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 "
              >
                Your email
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                placeholder="name@gmail.com"
              />
              <span className="text-sm text-red-500">{formState.errors.email?.message}</span>
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block mb-2 text-sm font-medium text-gray-900 "
              >
                Subject
              </label>
              <input
                {...register("subject")}
                type="text"
                id="subject"
                className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 "
                placeholder="Let us know how we can help you"
              />
              <span className="text-sm text-red-500">{formState.errors.subject?.message}</span>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-900 "
              >
                Your message
              </label>
              <textarea
                id="message"
                rows={6}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 "
                placeholder="Leave a comment..."
                {...register("message")}
              ></textarea>
              <span className="text-sm text-red-500">{formState.errors.message?.message}</span>
            </div>
            <button
              form='contactForm'
              type="submit"
              className="py-3 px-5 text-sm font-medium text-center text-black rounded-lg bg-blue-800 sm:w-fit hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 "
            >
              Send message
            </button>
          </form>
        </div>
      </section>
      <ToastContainer />
    </>
  );
}
