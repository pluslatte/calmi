use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields, parse_macro_input};

// 参考： https://zenn.dev/tak_iwamoto/articles/890771ea5b8ad3

#[proc_macro_attribute]
pub fn object_based(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as DeriveInput);
    match generate_object_base_fields(&input) {
        Ok(generated) => generated,
        Err(err) => err.to_compile_error().into(),
    }
}

fn generate_object_base_fields(derive_input: &DeriveInput) -> Result<TokenStream, syn::Error> {
    let struct_data = match &derive_input.data {
        Data::Struct(value) => value,
        _ => {
            return Err(syn::Error::new_spanned(
                &derive_input.ident,
                "Must be struct type",
            ));
        }
    };

    let ident = &derive_input.ident;
    let vis = &derive_input.vis;
    let attrs = &derive_input.attrs;
    let generics = &derive_input.generics;

    let existing_fields = match &struct_data.fields {
        Fields::Named(fields) => {
            let fields = &fields.named;
            quote! { #fields }
        }
        Fields::Unnamed(_) => {
            return Err(syn::Error::new_spanned(
                &derive_input.ident,
                "Tuple structs are not supported",
            ));
        }
        Fields::Unit => quote! {},
    };

    let common_fields_of_object = quote! {
        #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
        pub context: Option<crate::activitypub::types::enums::SingleOrMultiple<String>>,

        /// https://www.w3.org/TR/activitypub/#obj-id
        /// - ActivityPub specification requires `id` property
        /// - `id` is a globally unique identifier for the object
        pub id: String,

        /// https://www.w3.org/TR/activitypub/#obj-id
        /// - ActivityPub specification requires `type` property
        /// - `type` indicates the type of the object
        #[serde(rename = "type")]
        pub r#type: String
    };

    let fields_output = if existing_fields.is_empty() {
        quote! { #common_fields_of_object }
    } else {
        quote! { #common_fields_of_object, #existing_fields }
    };

    let expanded = quote! {
        #(#attrs)*
        #vis struct #ident #generics {
            #fields_output
        }
    };

    Ok(expanded.into())
}
