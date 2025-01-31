import QuoteForm from "@/components/QuoteForm";

const Quote = () => {
  return (
    <div className="flex min-h-screen items-center justify-center py-20 bg-background">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get a Free Quote</h1>
          <p className="text-lg text-muted-foreground">
            Fill out the form below and we'll get back to you with a customized
            quote for your property.
          </p>
        </div>
        <QuoteForm />
      </div>
    </div>
  );
};

export default Quote;