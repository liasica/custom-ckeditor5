/**
 * 占位
 * @see https://ckeditor.com/docs/ckeditor5/latest/framework/guides/tutorials/implementing-an-inline-widget.html
 */
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils'

export default function ContractPlaceholder (editor) {
    const { model, conversion, editing } = editor

    editing.mapper.on(
        'viewToModelPosition',
        viewToModelPositionOutsideModelElement(model, viewElement => viewElement.hasClass('placeholder'))
    )

    model.schema.register('placeholder', {
        // Allow wherever text is allowed:
        allowWhere: '$text',

        // The placeholder will act as an inline node:
        isInline: true,

        // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
        isObject: true,

        // The inline widget can have the same attributes as text (for example linkHref, bold).
        allowAttributesOf: '$text',

        // The placeholder can have many types, like date, name, surname, etc:
        allowAttributes: ['name'],
    })

    conversion.for('upcast').elementToElement({
        view: {
            name: 'span',
            classes: ['placeholder']
        },
        model: (viewElement, { writer: modelWriter }) => {
            // Extract the "name" from "{name}".
            const name = viewElement.getChild(0).data.slice(1, -1)

            return modelWriter.createElement('placeholder', { name })
        }
    })
    
    conversion.for('editingDowncast').elementToElement({
        model: 'placeholder',
        view: (modelItem, { writer: viewWriter }) => {
            const widgetElement = createPlaceholderView(modelItem, viewWriter)

            // Enable widget handling on a placeholder element inside the editing view.
            return toWidget(widgetElement, viewWriter)
        }
    })

    conversion.for('dataDowncast').elementToElement({
        model: 'placeholder',
        view: (modelItem, { writer: viewWriter }) => createPlaceholderView(modelItem, viewWriter)
    })

    // Helper method for both downcast converters.
    function createPlaceholderView(modelItem, viewWriter) {
        const name = modelItem.getAttribute('name')

        const placeholderView = viewWriter.createContainerElement('span', {
            class: 'placeholder'
        }, {
            isAllowedInsideAttributeElement: true
        })

        // Insert the placeholder name (as a text).
        const innerText = viewWriter.createText('{' + name + '}')
        viewWriter.insert(viewWriter.createPositionAt(placeholderView, 0), innerText)

        return placeholderView
    }
}